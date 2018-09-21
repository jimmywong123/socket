/* */ 
'use strict';
var http = require('http');
var read = require('fs').readFileSync;
var path = require('path');
var exists = require('fs').existsSync;
var engine = require('engine.io');
var clientVersion = require('socket.io-client/package.json!systemjs-json').version;
var Client = require('./client');
var Emitter = require('events').EventEmitter;
var Namespace = require('./namespace');
var ParentNamespace = require('./parent-namespace');
var Adapter = require('socket.io-adapter');
var parser = require('socket.io-parser');
var debug = require('debug')('socket.io:server');
var url = require('url');
module.exports = Server;
var clientSource = undefined;
var clientSourceMap = undefined;
function Server(srv, opts) {
  if (!(this instanceof Server))
    return new Server(srv, opts);
  if ('object' == typeof srv && srv instanceof Object && !srv.listen) {
    opts = srv;
    srv = null;
  }
  opts = opts || {};
  this.nsps = {};
  this.parentNsps = new Map();
  this.path(opts.path || '/socket.io');
  this.serveClient(false !== opts.serveClient);
  this.parser = opts.parser || parser;
  this.encoder = new this.parser.Encoder();
  this.adapter(opts.adapter || Adapter);
  this.origins(opts.origins || '*:*');
  this.sockets = this.of('/');
  if (srv)
    this.attach(srv, opts);
}
Server.prototype.checkRequest = function(req, fn) {
  var origin = req.headers.origin || req.headers.referer;
  if ('null' == origin || null == origin)
    origin = '*';
  if (!!origin && typeof(this._origins) == 'function')
    return this._origins(origin, fn);
  if (this._origins.indexOf('*:*') !== -1)
    return fn(null, true);
  if (origin) {
    try {
      var parts = url.parse(origin);
      var defaultPort = 'https:' == parts.protocol ? 443 : 80;
      parts.port = parts.port != null ? parts.port : defaultPort;
      var ok = ~this._origins.indexOf(parts.protocol + '//' + parts.hostname + ':' + parts.port) || ~this._origins.indexOf(parts.hostname + ':' + parts.port) || ~this._origins.indexOf(parts.hostname + ':*') || ~this._origins.indexOf('*:' + parts.port);
      debug('origin %s is %svalid', origin, !!ok ? '' : 'not ');
      return fn(null, !!ok);
    } catch (ex) {}
  }
  fn(null, false);
};
Server.prototype.serveClient = function(v) {
  if (!arguments.length)
    return this._serveClient;
  this._serveClient = v;
  var resolvePath = function(file) {
    var filepath = path.resolve(__dirname, './../../', file);
    if (exists(filepath)) {
      return filepath;
    }
    return require.resolve(file);
  };
  if (v && !clientSource) {
    clientSource = read(resolvePath('socket.io-client/dist/socket.io.js'), 'utf-8');
    try {
      clientSourceMap = read(resolvePath('socket.io-client/dist/socket.io.js.map'), 'utf-8');
    } catch (err) {
      debug('could not load sourcemap file');
    }
  }
  return this;
};
var oldSettings = {
  "transports": "transports",
  "heartbeat timeout": "pingTimeout",
  "heartbeat interval": "pingInterval",
  "destroy buffer size": "maxHttpBufferSize"
};
Server.prototype.set = function(key, val) {
  if ('authorization' == key && val) {
    this.use(function(socket, next) {
      val(socket.request, function(err, authorized) {
        if (err)
          return next(new Error(err));
        if (!authorized)
          return next(new Error('Not authorized'));
        next();
      });
    });
  } else if ('origins' == key && val) {
    this.origins(val);
  } else if ('resource' == key) {
    this.path(val);
  } else if (oldSettings[key] && this.eio[oldSettings[key]]) {
    this.eio[oldSettings[key]] = val;
  } else {
    console.error('Option %s is not valid. Please refer to the README.', key);
  }
  return this;
};
Server.prototype.checkNamespace = function(name, query, fn) {
  if (this.parentNsps.size === 0)
    return fn(false);
  const keysIterator = this.parentNsps.keys();
  const run = () => {
    let nextFn = keysIterator.next();
    if (nextFn.done) {
      return fn(false);
    }
    nextFn.value(name, query, (err, allow) => {
      if (err || !allow) {
        run();
      } else {
        fn(this.parentNsps.get(nextFn.value).createChild(name));
      }
    });
  };
  run();
};
Server.prototype.path = function(v) {
  if (!arguments.length)
    return this._path;
  this._path = v.replace(/\/$/, '');
  return this;
};
Server.prototype.adapter = function(v) {
  if (!arguments.length)
    return this._adapter;
  this._adapter = v;
  for (var i in this.nsps) {
    if (this.nsps.hasOwnProperty(i)) {
      this.nsps[i].initAdapter();
    }
  }
  return this;
};
Server.prototype.origins = function(v) {
  if (!arguments.length)
    return this._origins;
  this._origins = v;
  return this;
};
Server.prototype.listen = Server.prototype.attach = function(srv, opts) {
  if ('function' == typeof srv) {
    var msg = 'You are trying to attach socket.io to an express ' + 'request handler function. Please pass a http.Server instance.';
    throw new Error(msg);
  }
  if (Number(srv) == srv) {
    srv = Number(srv);
  }
  if ('number' == typeof srv) {
    debug('creating http server and binding to %d', srv);
    var port = srv;
    srv = http.Server(function(req, res) {
      res.writeHead(404);
      res.end();
    });
    srv.listen(port);
  }
  opts = opts || {};
  opts.path = opts.path || this.path();
  opts.allowRequest = opts.allowRequest || this.checkRequest.bind(this);
  if (this.sockets.fns.length > 0) {
    this.initEngine(srv, opts);
    return this;
  }
  var self = this;
  var connectPacket = {
    type: parser.CONNECT,
    nsp: '/'
  };
  this.encoder.encode(connectPacket, function(encodedPacket) {
    opts.initialPacket = encodedPacket;
    self.initEngine(srv, opts);
  });
  return this;
};
Server.prototype.initEngine = function(srv, opts) {
  debug('creating engine.io instance with opts %j', opts);
  this.eio = engine.attach(srv, opts);
  if (this._serveClient)
    this.attachServe(srv);
  this.httpServer = srv;
  this.bind(this.eio);
};
Server.prototype.attachServe = function(srv) {
  debug('attaching client serving req handler');
  var url = this._path + '/socket.io.js';
  var urlMap = this._path + '/socket.io.js.map';
  var evs = srv.listeners('request').slice(0);
  var self = this;
  srv.removeAllListeners('request');
  srv.on('request', function(req, res) {
    if (0 === req.url.indexOf(urlMap)) {
      self.serveMap(req, res);
    } else if (0 === req.url.indexOf(url)) {
      self.serve(req, res);
    } else {
      for (var i = 0; i < evs.length; i++) {
        evs[i].call(srv, req, res);
      }
    }
  });
};
Server.prototype.serve = function(req, res) {
  var expectedEtag = '"' + clientVersion + '"';
  var etag = req.headers['if-none-match'];
  if (etag) {
    if (expectedEtag == etag) {
      debug('serve client 304');
      res.writeHead(304);
      res.end();
      return;
    }
  }
  debug('serve client source');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('ETag', expectedEtag);
  res.writeHead(200);
  res.end(clientSource);
};
Server.prototype.serveMap = function(req, res) {
  var expectedEtag = '"' + clientVersion + '"';
  var etag = req.headers['if-none-match'];
  if (etag) {
    if (expectedEtag == etag) {
      debug('serve client 304');
      res.writeHead(304);
      res.end();
      return;
    }
  }
  debug('serve client sourcemap');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('ETag', expectedEtag);
  res.writeHead(200);
  res.end(clientSourceMap);
};
Server.prototype.bind = function(engine) {
  this.engine = engine;
  this.engine.on('connection', this.onconnection.bind(this));
  return this;
};
Server.prototype.onconnection = function(conn) {
  debug('incoming connection with id %s', conn.id);
  var client = new Client(this, conn);
  client.connect('/');
  return this;
};
Server.prototype.of = function(name, fn) {
  if (typeof name === 'function' || name instanceof RegExp) {
    const parentNsp = new ParentNamespace(this);
    debug('initializing parent namespace %s', parentNsp.name);
    if (typeof name === 'function') {
      this.parentNsps.set(name, parentNsp);
    } else {
      this.parentNsps.set((nsp, conn, next) => next(null, name.test(nsp)), parentNsp);
    }
    if (fn)
      parentNsp.on('connect', fn);
    return parentNsp;
  }
  if (String(name)[0] !== '/')
    name = '/' + name;
  var nsp = this.nsps[name];
  if (!nsp) {
    debug('initializing namespace %s', name);
    nsp = new Namespace(this, name);
    this.nsps[name] = nsp;
  }
  if (fn)
    nsp.on('connect', fn);
  return nsp;
};
Server.prototype.close = function(fn) {
  for (var id in this.nsps['/'].sockets) {
    if (this.nsps['/'].sockets.hasOwnProperty(id)) {
      this.nsps['/'].sockets[id].onclose();
    }
  }
  this.engine.close();
  if (this.httpServer) {
    this.httpServer.close(fn);
  } else {
    fn && fn();
  }
};
var emitterMethods = Object.keys(Emitter.prototype).filter(function(key) {
  return typeof Emitter.prototype[key] === 'function';
});
emitterMethods.concat(['to', 'in', 'use', 'send', 'write', 'clients', 'compress', 'binary']).forEach(function(fn) {
  Server.prototype[fn] = function() {
    return this.sockets[fn].apply(this.sockets, arguments);
  };
});
Namespace.flags.forEach(function(flag) {
  Object.defineProperty(Server.prototype, flag, {get: function() {
      this.sockets.flags = this.sockets.flags || {};
      this.sockets.flags[flag] = true;
      return this;
    }});
});
Server.listen = Server;
