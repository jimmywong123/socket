/* */ 
(function(process) {
  var parser = require('socket.io-parser');
  var debug = require('debug')('socket.io:client');
  var url = require('url');
  module.exports = Client;
  function Client(server, conn) {
    this.server = server;
    this.conn = conn;
    this.encoder = server.encoder;
    this.decoder = new server.parser.Decoder();
    this.id = conn.id;
    this.request = conn.request;
    this.setup();
    this.sockets = {};
    this.nsps = {};
    this.connectBuffer = [];
  }
  Client.prototype.setup = function() {
    this.onclose = this.onclose.bind(this);
    this.ondata = this.ondata.bind(this);
    this.onerror = this.onerror.bind(this);
    this.ondecoded = this.ondecoded.bind(this);
    this.decoder.on('decoded', this.ondecoded);
    this.conn.on('data', this.ondata);
    this.conn.on('error', this.onerror);
    this.conn.on('close', this.onclose);
  };
  Client.prototype.connect = function(name, query) {
    if (this.server.nsps[name]) {
      debug('connecting to namespace %s', name);
      return this.doConnect(name, query);
    }
    this.server.checkNamespace(name, query, (dynamicNsp) => {
      if (dynamicNsp) {
        debug('dynamic namespace %s was created', dynamicNsp.name);
        this.doConnect(name, query);
      } else {
        debug('creation of namespace %s was denied', name);
        this.packet({
          type: parser.ERROR,
          nsp: name,
          data: 'Invalid namespace'
        });
      }
    });
  };
  Client.prototype.doConnect = function(name, query) {
    var nsp = this.server.of(name);
    if ('/' != name && !this.nsps['/']) {
      this.connectBuffer.push(name);
      return;
    }
    var self = this;
    var socket = nsp.add(this, query, function() {
      self.sockets[socket.id] = socket;
      self.nsps[nsp.name] = socket;
      if ('/' == nsp.name && self.connectBuffer.length > 0) {
        self.connectBuffer.forEach(self.connect, self);
        self.connectBuffer = [];
      }
    });
  };
  Client.prototype.disconnect = function() {
    for (var id in this.sockets) {
      if (this.sockets.hasOwnProperty(id)) {
        this.sockets[id].disconnect();
      }
    }
    this.sockets = {};
    this.close();
  };
  Client.prototype.remove = function(socket) {
    if (this.sockets.hasOwnProperty(socket.id)) {
      var nsp = this.sockets[socket.id].nsp.name;
      delete this.sockets[socket.id];
      delete this.nsps[nsp];
    } else {
      debug('ignoring remove for %s', socket.id);
    }
  };
  Client.prototype.close = function() {
    if ('open' == this.conn.readyState) {
      debug('forcing transport close');
      this.conn.close();
      this.onclose('forced server close');
    }
  };
  Client.prototype.packet = function(packet, opts) {
    opts = opts || {};
    var self = this;
    function writeToEngine(encodedPackets) {
      if (opts.volatile && !self.conn.transport.writable)
        return;
      for (var i = 0; i < encodedPackets.length; i++) {
        self.conn.write(encodedPackets[i], {compress: opts.compress});
      }
    }
    if ('open' == this.conn.readyState) {
      debug('writing packet %j', packet);
      if (!opts.preEncoded) {
        this.encoder.encode(packet, writeToEngine);
      } else {
        writeToEngine(packet);
      }
    } else {
      debug('ignoring packet write %j', packet);
    }
  };
  Client.prototype.ondata = function(data) {
    try {
      this.decoder.add(data);
    } catch (e) {
      this.onerror(e);
    }
  };
  Client.prototype.ondecoded = function(packet) {
    if (parser.CONNECT == packet.type) {
      this.connect(url.parse(packet.nsp).pathname, url.parse(packet.nsp, true).query);
    } else {
      var socket = this.nsps[packet.nsp];
      if (socket) {
        process.nextTick(function() {
          socket.onpacket(packet);
        });
      } else {
        debug('no socket for namespace %s', packet.nsp);
      }
    }
  };
  Client.prototype.onerror = function(err) {
    for (var id in this.sockets) {
      if (this.sockets.hasOwnProperty(id)) {
        this.sockets[id].onerror(err);
      }
    }
    this.conn.close();
  };
  Client.prototype.onclose = function(reason) {
    debug('client close with reason %s', reason);
    this.destroy();
    for (var id in this.sockets) {
      if (this.sockets.hasOwnProperty(id)) {
        this.sockets[id].onclose(reason);
      }
    }
    this.sockets = {};
    this.decoder.destroy();
  };
  Client.prototype.destroy = function() {
    this.conn.removeListener('data', this.ondata);
    this.conn.removeListener('error', this.onerror);
    this.conn.removeListener('close', this.onclose);
    this.decoder.removeListener('decoded', this.ondecoded);
  };
})(require('process'));
