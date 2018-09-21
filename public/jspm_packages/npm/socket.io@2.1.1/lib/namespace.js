/* */ 
(function(process) {
  var Socket = require('./socket');
  var Emitter = require('events').EventEmitter;
  var parser = require('socket.io-parser');
  var hasBin = require('has-binary2');
  var debug = require('debug')('socket.io:namespace');
  module.exports = exports = Namespace;
  exports.events = ['connect', 'connection', 'newListener'];
  exports.flags = ['json', 'volatile', 'local'];
  var emit = Emitter.prototype.emit;
  function Namespace(server, name) {
    this.name = name;
    this.server = server;
    this.sockets = {};
    this.connected = {};
    this.fns = [];
    this.ids = 0;
    this.rooms = [];
    this.flags = {};
    this.initAdapter();
  }
  Namespace.prototype.__proto__ = Emitter.prototype;
  exports.flags.forEach(function(flag) {
    Object.defineProperty(Namespace.prototype, flag, {get: function() {
        this.flags[flag] = true;
        return this;
      }});
  });
  Namespace.prototype.initAdapter = function() {
    this.adapter = new (this.server.adapter())(this);
  };
  Namespace.prototype.use = function(fn) {
    if (this.server.eio && this.name === '/') {
      debug('removing initial packet');
      delete this.server.eio.initialPacket;
    }
    this.fns.push(fn);
    return this;
  };
  Namespace.prototype.run = function(socket, fn) {
    var fns = this.fns.slice(0);
    if (!fns.length)
      return fn(null);
    function run(i) {
      fns[i](socket, function(err) {
        if (err)
          return fn(err);
        if (!fns[i + 1])
          return fn(null);
        run(i + 1);
      });
    }
    run(0);
  };
  Namespace.prototype.to = Namespace.prototype.in = function(name) {
    if (!~this.rooms.indexOf(name))
      this.rooms.push(name);
    return this;
  };
  Namespace.prototype.add = function(client, query, fn) {
    debug('adding socket to nsp %s', this.name);
    var socket = new Socket(this, client, query);
    var self = this;
    this.run(socket, function(err) {
      process.nextTick(function() {
        if ('open' == client.conn.readyState) {
          if (err)
            return socket.error(err.data || err.message);
          self.sockets[socket.id] = socket;
          socket.onconnect();
          if (fn)
            fn();
          self.emit('connect', socket);
          self.emit('connection', socket);
        } else {
          debug('next called after client was closed - ignoring socket');
        }
      });
    });
    return socket;
  };
  Namespace.prototype.remove = function(socket) {
    if (this.sockets.hasOwnProperty(socket.id)) {
      delete this.sockets[socket.id];
    } else {
      debug('ignoring remove for %s', socket.id);
    }
  };
  Namespace.prototype.emit = function(ev) {
    if (~exports.events.indexOf(ev)) {
      emit.apply(this, arguments);
      return this;
    }
    var args = Array.prototype.slice.call(arguments);
    var packet = {
      type: (this.flags.binary !== undefined ? this.flags.binary : hasBin(args)) ? parser.BINARY_EVENT : parser.EVENT,
      data: args
    };
    if ('function' == typeof args[args.length - 1]) {
      throw new Error('Callbacks are not supported when broadcasting');
    }
    var rooms = this.rooms.slice(0);
    var flags = Object.assign({}, this.flags);
    this.rooms = [];
    this.flags = {};
    this.adapter.broadcast(packet, {
      rooms: rooms,
      flags: flags
    });
    return this;
  };
  Namespace.prototype.send = Namespace.prototype.write = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('message');
    this.emit.apply(this, args);
    return this;
  };
  Namespace.prototype.clients = function(fn) {
    this.adapter.clients(this.rooms, fn);
    this.rooms = [];
    return this;
  };
  Namespace.prototype.compress = function(compress) {
    this.flags.compress = compress;
    return this;
  };
  Namespace.prototype.binary = function(binary) {
    this.flags.binary = binary;
    return this;
  };
})(require('process'));
