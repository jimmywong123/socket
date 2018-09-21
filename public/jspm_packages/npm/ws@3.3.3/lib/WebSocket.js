/* */ 
(function(Buffer) {
  'use strict';
  const EventEmitter = require('events');
  const crypto = require('crypto');
  const Ultron = require('ultron');
  const https = require('https');
  const http = require('http');
  const url = require('url');
  const PerMessageDeflate = require('./PerMessageDeflate');
  const EventTarget = require('./EventTarget');
  const Extensions = require('./Extensions');
  const constants = require('./Constants');
  const Receiver = require('./Receiver');
  const Sender = require('./Sender');
  const protocolVersions = [8, 13];
  const closeTimeout = 30 * 1000;
  class WebSocket extends EventEmitter {
    constructor(address, protocols, options) {
      super();
      if (!protocols) {
        protocols = [];
      } else if (typeof protocols === 'string') {
        protocols = [protocols];
      } else if (!Array.isArray(protocols)) {
        options = protocols;
        protocols = [];
      }
      this.readyState = WebSocket.CONNECTING;
      this.bytesReceived = 0;
      this.extensions = {};
      this.protocol = '';
      this._binaryType = constants.BINARY_TYPES[0];
      this._finalize = this.finalize.bind(this);
      this._closeFrameReceived = false;
      this._closeFrameSent = false;
      this._closeMessage = '';
      this._closeTimer = null;
      this._finalized = false;
      this._closeCode = 1006;
      this._receiver = null;
      this._sender = null;
      this._socket = null;
      this._ultron = null;
      if (Array.isArray(address)) {
        initAsServerClient.call(this, address[0], address[1], options);
      } else {
        initAsClient.call(this, address, protocols, options);
      }
    }
    get CONNECTING() {
      return WebSocket.CONNECTING;
    }
    get CLOSING() {
      return WebSocket.CLOSING;
    }
    get CLOSED() {
      return WebSocket.CLOSED;
    }
    get OPEN() {
      return WebSocket.OPEN;
    }
    get bufferedAmount() {
      var amount = 0;
      if (this._socket) {
        amount = this._socket.bufferSize + this._sender._bufferedBytes;
      }
      return amount;
    }
    get binaryType() {
      return this._binaryType;
    }
    set binaryType(type) {
      if (constants.BINARY_TYPES.indexOf(type) < 0)
        return;
      this._binaryType = type;
      if (this._receiver)
        this._receiver._binaryType = type;
    }
    setSocket(socket, head) {
      socket.setTimeout(0);
      socket.setNoDelay();
      this._receiver = new Receiver(this.extensions, this._maxPayload, this.binaryType);
      this._sender = new Sender(socket, this.extensions);
      this._ultron = new Ultron(socket);
      this._socket = socket;
      this._ultron.on('close', this._finalize);
      this._ultron.on('error', this._finalize);
      this._ultron.on('end', this._finalize);
      if (head.length > 0)
        socket.unshift(head);
      this._ultron.on('data', (data) => {
        this.bytesReceived += data.length;
        this._receiver.add(data);
      });
      this._receiver.onmessage = (data) => this.emit('message', data);
      this._receiver.onping = (data) => {
        this.pong(data, !this._isServer, true);
        this.emit('ping', data);
      };
      this._receiver.onpong = (data) => this.emit('pong', data);
      this._receiver.onclose = (code, reason) => {
        this._closeFrameReceived = true;
        this._closeMessage = reason;
        this._closeCode = code;
        if (!this._finalized)
          this.close(code, reason);
      };
      this._receiver.onerror = (error, code) => {
        this._closeMessage = '';
        this._closeCode = code;
        this.readyState = WebSocket.CLOSING;
        this.emit('error', error);
        this.finalize(true);
      };
      this.readyState = WebSocket.OPEN;
      this.emit('open');
    }
    finalize(error) {
      if (this._finalized)
        return;
      this.readyState = WebSocket.CLOSING;
      this._finalized = true;
      if (typeof error === 'object')
        this.emit('error', error);
      if (!this._socket)
        return this.emitClose();
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
      this._ultron.destroy();
      this._ultron = null;
      this._socket.on('error', constants.NOOP);
      if (!error)
        this._socket.end();
      else
        this._socket.destroy();
      this._socket = null;
      this._sender = null;
      this._receiver.cleanup(() => this.emitClose());
      this._receiver = null;
    }
    emitClose() {
      this.readyState = WebSocket.CLOSED;
      this.emit('close', this._closeCode, this._closeMessage);
      if (this.extensions[PerMessageDeflate.extensionName]) {
        this.extensions[PerMessageDeflate.extensionName].cleanup();
      }
      this.extensions = null;
      this.removeAllListeners();
    }
    pause() {
      if (this.readyState !== WebSocket.OPEN)
        throw new Error('not opened');
      this._socket.pause();
    }
    resume() {
      if (this.readyState !== WebSocket.OPEN)
        throw new Error('not opened');
      this._socket.resume();
    }
    close(code, data) {
      if (this.readyState === WebSocket.CLOSED)
        return;
      if (this.readyState === WebSocket.CONNECTING) {
        this._req.abort();
        this.finalize(new Error('closed before the connection is established'));
        return;
      }
      if (this.readyState === WebSocket.CLOSING) {
        if (this._closeFrameSent && this._closeFrameReceived)
          this._socket.end();
        return;
      }
      this.readyState = WebSocket.CLOSING;
      this._sender.close(code, data, !this._isServer, (err) => {
        if (err)
          return;
        this._closeFrameSent = true;
        if (!this._finalized) {
          if (this._closeFrameReceived)
            this._socket.end();
          this._closeTimer = setTimeout(this._finalize, closeTimeout, true);
        }
      });
    }
    ping(data, mask, failSilently) {
      if (this.readyState !== WebSocket.OPEN) {
        if (failSilently)
          return;
        throw new Error('not opened');
      }
      if (typeof data === 'number')
        data = data.toString();
      if (mask === undefined)
        mask = !this._isServer;
      this._sender.ping(data || constants.EMPTY_BUFFER, mask);
    }
    pong(data, mask, failSilently) {
      if (this.readyState !== WebSocket.OPEN) {
        if (failSilently)
          return;
        throw new Error('not opened');
      }
      if (typeof data === 'number')
        data = data.toString();
      if (mask === undefined)
        mask = !this._isServer;
      this._sender.pong(data || constants.EMPTY_BUFFER, mask);
    }
    send(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      if (this.readyState !== WebSocket.OPEN) {
        if (cb)
          cb(new Error('not opened'));
        else
          throw new Error('not opened');
        return;
      }
      if (typeof data === 'number')
        data = data.toString();
      const opts = Object.assign({
        binary: typeof data !== 'string',
        mask: !this._isServer,
        compress: true,
        fin: true
      }, options);
      if (!this.extensions[PerMessageDeflate.extensionName]) {
        opts.compress = false;
      }
      this._sender.send(data || constants.EMPTY_BUFFER, opts, cb);
    }
    terminate() {
      if (this.readyState === WebSocket.CLOSED)
        return;
      if (this.readyState === WebSocket.CONNECTING) {
        this._req.abort();
        this.finalize(new Error('closed before the connection is established'));
        return;
      }
      this.finalize(true);
    }
  }
  WebSocket.CONNECTING = 0;
  WebSocket.OPEN = 1;
  WebSocket.CLOSING = 2;
  WebSocket.CLOSED = 3;
  ['open', 'error', 'close', 'message'].forEach((method) => {
    Object.defineProperty(WebSocket.prototype, `on${method}`, {
      get() {
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i]._listener)
            return listeners[i]._listener;
        }
      },
      set(listener) {
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i]._listener)
            this.removeListener(method, listeners[i]);
        }
        this.addEventListener(method, listener);
      }
    });
  });
  WebSocket.prototype.addEventListener = EventTarget.addEventListener;
  WebSocket.prototype.removeEventListener = EventTarget.removeEventListener;
  module.exports = WebSocket;
  function initAsServerClient(socket, head, options) {
    this.protocolVersion = options.protocolVersion;
    this._maxPayload = options.maxPayload;
    this.extensions = options.extensions;
    this.protocol = options.protocol;
    this._isServer = true;
    this.setSocket(socket, head);
  }
  function initAsClient(address, protocols, options) {
    options = Object.assign({
      protocolVersion: protocolVersions[1],
      protocol: protocols.join(','),
      perMessageDeflate: true,
      handshakeTimeout: null,
      localAddress: null,
      headers: null,
      family: null,
      origin: null,
      agent: null,
      host: null,
      checkServerIdentity: null,
      rejectUnauthorized: null,
      passphrase: null,
      ciphers: null,
      ecdhCurve: null,
      cert: null,
      key: null,
      pfx: null,
      ca: null
    }, options);
    if (protocolVersions.indexOf(options.protocolVersion) === -1) {
      throw new Error(`unsupported protocol version: ${options.protocolVersion} ` + `(supported versions: ${protocolVersions.join(', ')})`);
    }
    this.protocolVersion = options.protocolVersion;
    this._isServer = false;
    this.url = address;
    const serverUrl = url.parse(address);
    const isUnixSocket = serverUrl.protocol === 'ws+unix:';
    if (!serverUrl.host && (!isUnixSocket || !serverUrl.path)) {
      throw new Error('invalid url');
    }
    const isSecure = serverUrl.protocol === 'wss:' || serverUrl.protocol === 'https:';
    const key = crypto.randomBytes(16).toString('base64');
    const httpObj = isSecure ? https : http;
    var perMessageDeflate;
    const requestOptions = {
      port: serverUrl.port || (isSecure ? 443 : 80),
      host: serverUrl.hostname,
      path: '/',
      headers: {
        'Sec-WebSocket-Version': options.protocolVersion,
        'Sec-WebSocket-Key': key,
        'Connection': 'Upgrade',
        'Upgrade': 'websocket'
      }
    };
    if (options.headers)
      Object.assign(requestOptions.headers, options.headers);
    if (options.perMessageDeflate) {
      perMessageDeflate = new PerMessageDeflate(options.perMessageDeflate !== true ? options.perMessageDeflate : {}, false);
      requestOptions.headers['Sec-WebSocket-Extensions'] = Extensions.format({[PerMessageDeflate.extensionName]: perMessageDeflate.offer()});
    }
    if (options.protocol) {
      requestOptions.headers['Sec-WebSocket-Protocol'] = options.protocol;
    }
    if (options.origin) {
      if (options.protocolVersion < 13) {
        requestOptions.headers['Sec-WebSocket-Origin'] = options.origin;
      } else {
        requestOptions.headers.Origin = options.origin;
      }
    }
    if (options.host)
      requestOptions.headers.Host = options.host;
    if (serverUrl.auth)
      requestOptions.auth = serverUrl.auth;
    if (options.localAddress)
      requestOptions.localAddress = options.localAddress;
    if (options.family)
      requestOptions.family = options.family;
    if (isUnixSocket) {
      const parts = serverUrl.path.split(':');
      requestOptions.socketPath = parts[0];
      requestOptions.path = parts[1];
    } else if (serverUrl.path) {
      if (serverUrl.path.charAt(0) !== '/') {
        requestOptions.path = `/${serverUrl.path}`;
      } else {
        requestOptions.path = serverUrl.path;
      }
    }
    var agent = options.agent;
    if (options.rejectUnauthorized != null || options.checkServerIdentity || options.passphrase || options.ciphers || options.ecdhCurve || options.cert || options.key || options.pfx || options.ca) {
      if (options.passphrase)
        requestOptions.passphrase = options.passphrase;
      if (options.ciphers)
        requestOptions.ciphers = options.ciphers;
      if (options.ecdhCurve)
        requestOptions.ecdhCurve = options.ecdhCurve;
      if (options.cert)
        requestOptions.cert = options.cert;
      if (options.key)
        requestOptions.key = options.key;
      if (options.pfx)
        requestOptions.pfx = options.pfx;
      if (options.ca)
        requestOptions.ca = options.ca;
      if (options.checkServerIdentity) {
        requestOptions.checkServerIdentity = options.checkServerIdentity;
      }
      if (options.rejectUnauthorized != null) {
        requestOptions.rejectUnauthorized = options.rejectUnauthorized;
      }
      if (!agent)
        agent = new httpObj.Agent(requestOptions);
    }
    if (agent)
      requestOptions.agent = agent;
    this._req = httpObj.get(requestOptions);
    if (options.handshakeTimeout) {
      this._req.setTimeout(options.handshakeTimeout, () => {
        this._req.abort();
        this.finalize(new Error('opening handshake has timed out'));
      });
    }
    this._req.on('error', (error) => {
      if (this._req.aborted)
        return;
      this._req = null;
      this.finalize(error);
    });
    this._req.on('response', (res) => {
      if (!this.emit('unexpected-response', this._req, res)) {
        this._req.abort();
        this.finalize(new Error(`unexpected server response (${res.statusCode})`));
      }
    });
    this._req.on('upgrade', (res, socket, head) => {
      this.emit('headers', res.headers, res);
      if (this.readyState !== WebSocket.CONNECTING)
        return;
      this._req = null;
      const digest = crypto.createHash('sha1').update(key + constants.GUID, 'binary').digest('base64');
      if (res.headers['sec-websocket-accept'] !== digest) {
        socket.destroy();
        return this.finalize(new Error('invalid server key'));
      }
      const serverProt = res.headers['sec-websocket-protocol'];
      const protList = (options.protocol || '').split(/, */);
      var protError;
      if (!options.protocol && serverProt) {
        protError = 'server sent a subprotocol even though none requested';
      } else if (options.protocol && !serverProt) {
        protError = 'server sent no subprotocol even though requested';
      } else if (serverProt && protList.indexOf(serverProt) === -1) {
        protError = 'server responded with an invalid protocol';
      }
      if (protError) {
        socket.destroy();
        return this.finalize(new Error(protError));
      }
      if (serverProt)
        this.protocol = serverProt;
      if (perMessageDeflate) {
        try {
          const serverExtensions = Extensions.parse(res.headers['sec-websocket-extensions']);
          if (serverExtensions[PerMessageDeflate.extensionName]) {
            perMessageDeflate.accept(serverExtensions[PerMessageDeflate.extensionName]);
            this.extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
          }
        } catch (err) {
          socket.destroy();
          this.finalize(new Error('invalid Sec-WebSocket-Extensions header'));
          return;
        }
      }
      this.setSocket(socket, head);
    });
  }
})(require('buffer').Buffer);
