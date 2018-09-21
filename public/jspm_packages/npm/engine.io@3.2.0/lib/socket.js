/* */ 
(function(process) {
  var EventEmitter = require('events').EventEmitter;
  var util = require('util');
  var debug = require('debug')('engine:socket');
  module.exports = Socket;
  function Socket(id, server, transport, req) {
    this.id = id;
    this.server = server;
    this.upgrading = false;
    this.upgraded = false;
    this.readyState = 'opening';
    this.writeBuffer = [];
    this.packetsFn = [];
    this.sentCallbackFn = [];
    this.cleanupFn = [];
    this.request = req;
    if (req.websocket && req.websocket._socket) {
      this.remoteAddress = req.websocket._socket.remoteAddress;
    } else {
      this.remoteAddress = req.connection.remoteAddress;
    }
    this.checkIntervalTimer = null;
    this.upgradeTimeoutTimer = null;
    this.pingTimeoutTimer = null;
    this.setTransport(transport);
    this.onOpen();
  }
  util.inherits(Socket, EventEmitter);
  Socket.prototype.onOpen = function() {
    this.readyState = 'open';
    this.transport.sid = this.id;
    this.sendPacket('open', JSON.stringify({
      sid: this.id,
      upgrades: this.getAvailableUpgrades(),
      pingInterval: this.server.pingInterval,
      pingTimeout: this.server.pingTimeout
    }));
    if (this.server.initialPacket) {
      this.sendPacket('message', this.server.initialPacket);
    }
    this.emit('open');
    this.setPingTimeout();
  };
  Socket.prototype.onPacket = function(packet) {
    if ('open' === this.readyState) {
      debug('packet');
      this.emit('packet', packet);
      this.setPingTimeout();
      switch (packet.type) {
        case 'ping':
          debug('got ping');
          this.sendPacket('pong');
          this.emit('heartbeat');
          break;
        case 'error':
          this.onClose('parse error');
          break;
        case 'message':
          this.emit('data', packet.data);
          this.emit('message', packet.data);
          break;
      }
    } else {
      debug('packet received with closed socket');
    }
  };
  Socket.prototype.onError = function(err) {
    debug('transport error');
    this.onClose('transport error', err);
  };
  Socket.prototype.setPingTimeout = function() {
    var self = this;
    clearTimeout(self.pingTimeoutTimer);
    self.pingTimeoutTimer = setTimeout(function() {
      self.onClose('ping timeout');
    }, self.server.pingInterval + self.server.pingTimeout);
  };
  Socket.prototype.setTransport = function(transport) {
    var onError = this.onError.bind(this);
    var onPacket = this.onPacket.bind(this);
    var flush = this.flush.bind(this);
    var onClose = this.onClose.bind(this, 'transport close');
    this.transport = transport;
    this.transport.once('error', onError);
    this.transport.on('packet', onPacket);
    this.transport.on('drain', flush);
    this.transport.once('close', onClose);
    this.setupSendCallback();
    this.cleanupFn.push(function() {
      transport.removeListener('error', onError);
      transport.removeListener('packet', onPacket);
      transport.removeListener('drain', flush);
      transport.removeListener('close', onClose);
    });
  };
  Socket.prototype.maybeUpgrade = function(transport) {
    debug('might upgrade socket transport from "%s" to "%s"', this.transport.name, transport.name);
    this.upgrading = true;
    var self = this;
    self.upgradeTimeoutTimer = setTimeout(function() {
      debug('client did not complete upgrade - closing transport');
      cleanup();
      if ('open' === transport.readyState) {
        transport.close();
      }
    }, this.server.upgradeTimeout);
    function onPacket(packet) {
      if ('ping' === packet.type && 'probe' === packet.data) {
        transport.send([{
          type: 'pong',
          data: 'probe'
        }]);
        self.emit('upgrading', transport);
        clearInterval(self.checkIntervalTimer);
        self.checkIntervalTimer = setInterval(check, 100);
      } else if ('upgrade' === packet.type && self.readyState !== 'closed') {
        debug('got upgrade packet - upgrading');
        cleanup();
        self.transport.discard();
        self.upgraded = true;
        self.clearTransport();
        self.setTransport(transport);
        self.emit('upgrade', transport);
        self.setPingTimeout();
        self.flush();
        if (self.readyState === 'closing') {
          transport.close(function() {
            self.onClose('forced close');
          });
        }
      } else {
        cleanup();
        transport.close();
      }
    }
    function check() {
      if ('polling' === self.transport.name && self.transport.writable) {
        debug('writing a noop packet to polling for fast upgrade');
        self.transport.send([{type: 'noop'}]);
      }
    }
    function cleanup() {
      self.upgrading = false;
      clearInterval(self.checkIntervalTimer);
      self.checkIntervalTimer = null;
      clearTimeout(self.upgradeTimeoutTimer);
      self.upgradeTimeoutTimer = null;
      transport.removeListener('packet', onPacket);
      transport.removeListener('close', onTransportClose);
      transport.removeListener('error', onError);
      self.removeListener('close', onClose);
    }
    function onError(err) {
      debug('client did not complete upgrade - %s', err);
      cleanup();
      transport.close();
      transport = null;
    }
    function onTransportClose() {
      onError('transport closed');
    }
    function onClose() {
      onError('socket closed');
    }
    transport.on('packet', onPacket);
    transport.once('close', onTransportClose);
    transport.once('error', onError);
    self.once('close', onClose);
  };
  Socket.prototype.clearTransport = function() {
    var cleanup;
    var toCleanUp = this.cleanupFn.length;
    for (var i = 0; i < toCleanUp; i++) {
      cleanup = this.cleanupFn.shift();
      cleanup();
    }
    this.transport.on('error', function() {
      debug('error triggered by discarded transport');
    });
    this.transport.close();
    clearTimeout(this.pingTimeoutTimer);
  };
  Socket.prototype.onClose = function(reason, description) {
    if ('closed' !== this.readyState) {
      this.readyState = 'closed';
      clearTimeout(this.pingTimeoutTimer);
      clearInterval(this.checkIntervalTimer);
      this.checkIntervalTimer = null;
      clearTimeout(this.upgradeTimeoutTimer);
      var self = this;
      process.nextTick(function() {
        self.writeBuffer = [];
      });
      this.packetsFn = [];
      this.sentCallbackFn = [];
      this.clearTransport();
      this.emit('close', reason, description);
    }
  };
  Socket.prototype.setupSendCallback = function() {
    var self = this;
    this.transport.on('drain', onDrain);
    this.cleanupFn.push(function() {
      self.transport.removeListener('drain', onDrain);
    });
    function onDrain() {
      if (self.sentCallbackFn.length > 0) {
        var seqFn = self.sentCallbackFn.splice(0, 1)[0];
        if ('function' === typeof seqFn) {
          debug('executing send callback');
          seqFn(self.transport);
        } else if (Array.isArray(seqFn)) {
          debug('executing batch send callback');
          for (var l = seqFn.length,
              i = 0; i < l; i++) {
            if ('function' === typeof seqFn[i]) {
              seqFn[i](self.transport);
            }
          }
        }
      }
    }
  };
  Socket.prototype.send = Socket.prototype.write = function(data, options, callback) {
    this.sendPacket('message', data, options, callback);
    return this;
  };
  Socket.prototype.sendPacket = function(type, data, options, callback) {
    if ('function' === typeof options) {
      callback = options;
      options = null;
    }
    options = options || {};
    options.compress = false !== options.compress;
    if ('closing' !== this.readyState && 'closed' !== this.readyState) {
      debug('sending packet "%s" (%s)', type, data);
      var packet = {
        type: type,
        options: options
      };
      if (data)
        packet.data = data;
      this.emit('packetCreate', packet);
      this.writeBuffer.push(packet);
      if (callback)
        this.packetsFn.push(callback);
      this.flush();
    }
  };
  Socket.prototype.flush = function() {
    if ('closed' !== this.readyState && this.transport.writable && this.writeBuffer.length) {
      debug('flushing buffer to transport');
      this.emit('flush', this.writeBuffer);
      this.server.emit('flush', this, this.writeBuffer);
      var wbuf = this.writeBuffer;
      this.writeBuffer = [];
      if (!this.transport.supportsFraming) {
        this.sentCallbackFn.push(this.packetsFn);
      } else {
        this.sentCallbackFn.push.apply(this.sentCallbackFn, this.packetsFn);
      }
      this.packetsFn = [];
      this.transport.send(wbuf);
      this.emit('drain');
      this.server.emit('drain', this);
    }
  };
  Socket.prototype.getAvailableUpgrades = function() {
    var availableUpgrades = [];
    var allUpgrades = this.server.upgrades(this.transport.name);
    for (var i = 0,
        l = allUpgrades.length; i < l; ++i) {
      var upg = allUpgrades[i];
      if (this.server.transports.indexOf(upg) !== -1) {
        availableUpgrades.push(upg);
      }
    }
    return availableUpgrades;
  };
  Socket.prototype.close = function(discard) {
    if ('open' !== this.readyState)
      return;
    this.readyState = 'closing';
    if (this.writeBuffer.length) {
      this.once('drain', this.closeTransport.bind(this, discard));
      return;
    }
    this.closeTransport(discard);
  };
  Socket.prototype.closeTransport = function(discard) {
    if (discard)
      this.transport.discard();
    this.transport.close(this.onClose.bind(this, 'forced close'));
  };
})(require('process'));
