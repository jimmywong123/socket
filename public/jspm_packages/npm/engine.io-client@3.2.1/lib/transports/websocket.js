/* */ 
var Transport = require('../transport');
var parser = require('engine.io-parser');
var parseqs = require('parseqs');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
var NodeWebSocket;
if (typeof window === 'undefined') {
  try {
    NodeWebSocket = require('@empty');
  } catch (e) {}
}
var WebSocket = BrowserWebSocket;
if (!WebSocket && typeof window === 'undefined') {
  WebSocket = NodeWebSocket;
}
module.exports = WS;
function WS(opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
  this.protocols = opts.protocols;
  if (!this.usingBrowserWebSocket) {
    WebSocket = NodeWebSocket;
  }
  Transport.call(this, opts);
}
inherit(WS, Transport);
WS.prototype.name = 'websocket';
WS.prototype.supportsBinary = true;
WS.prototype.doOpen = function() {
  if (!this.check()) {
    return;
  }
  var uri = this.uri();
  var protocols = this.protocols;
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }
  if (this.localAddress) {
    opts.localAddress = this.localAddress;
  }
  try {
    this.ws = this.usingBrowserWebSocket ? (protocols ? new WebSocket(uri, protocols) : new WebSocket(uri)) : new WebSocket(uri, protocols, opts);
  } catch (err) {
    return this.emit('error', err);
  }
  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }
  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'nodebuffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }
  this.addEventListeners();
};
WS.prototype.addEventListeners = function() {
  var self = this;
  this.ws.onopen = function() {
    self.onOpen();
  };
  this.ws.onclose = function() {
    self.onClose();
  };
  this.ws.onmessage = function(ev) {
    self.onData(ev.data);
  };
  this.ws.onerror = function(e) {
    self.onError('websocket error', e);
  };
};
WS.prototype.write = function(packets) {
  var self = this;
  this.writable = false;
  var total = packets.length;
  for (var i = 0,
      l = total; i < l; i++) {
    (function(packet) {
      parser.encodePacket(packet, self.supportsBinary, function(data) {
        if (!self.usingBrowserWebSocket) {
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }
          if (self.perMessageDeflate) {
            var len = 'string' === typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }
        try {
          if (self.usingBrowserWebSocket) {
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e) {
          debug('websocket closed before onclose event');
        }
        --total || done();
      });
    })(packets[i]);
  }
  function done() {
    self.emit('flush');
    setTimeout(function() {
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};
WS.prototype.onClose = function() {
  Transport.prototype.onClose.call(this);
};
WS.prototype.doClose = function() {
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};
WS.prototype.uri = function() {
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';
  if (this.port && (('wss' === schema && Number(this.port) !== 443) || ('ws' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }
  if (!this.supportsBinary) {
    query.b64 = 1;
  }
  query = parseqs.encode(query);
  if (query.length) {
    query = '?' + query;
  }
  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};
WS.prototype.check = function() {
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};
