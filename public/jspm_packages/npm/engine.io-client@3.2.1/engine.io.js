/* */ 
"format cjs";
(function(Buffer, process) {
  (function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
      module.exports = factory();
    else if (typeof define === 'function' && define.amd)
      define([], factory);
    else if (typeof exports === 'object')
      exports["eio"] = factory();
    else
      root["eio"] = factory();
  })(this, function() {
    return (function(modules) {
      var installedModules = {};
      function __webpack_require__(moduleId) {
        if (installedModules[moduleId])
          return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
          exports: {},
          id: moduleId,
          loaded: false
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
      }
      __webpack_require__.m = modules;
      __webpack_require__.c = installedModules;
      __webpack_require__.p = "";
      return __webpack_require__(0);
    })([function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = __webpack_require__(1);
      module.exports.parser = __webpack_require__(8);
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        'use strict';
        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
          return typeof obj;
        } : function(obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
        var transports = __webpack_require__(2);
        var Emitter = __webpack_require__(18);
        var debug = __webpack_require__(22)('engine.io-client:socket');
        var index = __webpack_require__(29);
        var parser = __webpack_require__(8);
        var parseuri = __webpack_require__(30);
        var parseqs = __webpack_require__(19);
        module.exports = Socket;
        function Socket(uri, opts) {
          if (!(this instanceof Socket))
            return new Socket(uri, opts);
          opts = opts || {};
          if (uri && 'object' === (typeof uri === 'undefined' ? 'undefined' : _typeof(uri))) {
            opts = uri;
            uri = null;
          }
          if (uri) {
            uri = parseuri(uri);
            opts.hostname = uri.host;
            opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
            opts.port = uri.port;
            if (uri.query)
              opts.query = uri.query;
          } else if (opts.host) {
            opts.hostname = parseuri(opts.host).host;
          }
          this.secure = null != opts.secure ? opts.secure : global.location && 'https:' === location.protocol;
          if (opts.hostname && !opts.port) {
            opts.port = this.secure ? '443' : '80';
          }
          this.agent = opts.agent || false;
          this.hostname = opts.hostname || (global.location ? location.hostname : 'localhost');
          this.port = opts.port || (global.location && location.port ? location.port : this.secure ? 443 : 80);
          this.query = opts.query || {};
          if ('string' === typeof this.query)
            this.query = parseqs.decode(this.query);
          this.upgrade = false !== opts.upgrade;
          this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
          this.forceJSONP = !!opts.forceJSONP;
          this.jsonp = false !== opts.jsonp;
          this.forceBase64 = !!opts.forceBase64;
          this.enablesXDR = !!opts.enablesXDR;
          this.timestampParam = opts.timestampParam || 't';
          this.timestampRequests = opts.timestampRequests;
          this.transports = opts.transports || ['polling', 'websocket'];
          this.transportOptions = opts.transportOptions || {};
          this.readyState = '';
          this.writeBuffer = [];
          this.prevBufferLen = 0;
          this.policyPort = opts.policyPort || 843;
          this.rememberUpgrade = opts.rememberUpgrade || false;
          this.binaryType = null;
          this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
          this.perMessageDeflate = false !== opts.perMessageDeflate ? opts.perMessageDeflate || {} : false;
          if (true === this.perMessageDeflate)
            this.perMessageDeflate = {};
          if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
            this.perMessageDeflate.threshold = 1024;
          }
          this.pfx = opts.pfx || null;
          this.key = opts.key || null;
          this.passphrase = opts.passphrase || null;
          this.cert = opts.cert || null;
          this.ca = opts.ca || null;
          this.ciphers = opts.ciphers || null;
          this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
          this.forceNode = !!opts.forceNode;
          var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object' && global;
          if (freeGlobal.global === freeGlobal) {
            if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
              this.extraHeaders = opts.extraHeaders;
            }
            if (opts.localAddress) {
              this.localAddress = opts.localAddress;
            }
          }
          this.id = null;
          this.upgrades = null;
          this.pingInterval = null;
          this.pingTimeout = null;
          this.pingIntervalTimer = null;
          this.pingTimeoutTimer = null;
          this.open();
        }
        Socket.priorWebsocketSuccess = false;
        Emitter(Socket.prototype);
        Socket.protocol = parser.protocol;
        Socket.Socket = Socket;
        Socket.Transport = __webpack_require__(7);
        Socket.transports = __webpack_require__(2);
        Socket.parser = __webpack_require__(8);
        Socket.prototype.createTransport = function(name) {
          debug('creating transport "%s"', name);
          var query = clone(this.query);
          query.EIO = parser.protocol;
          query.transport = name;
          var options = this.transportOptions[name] || {};
          if (this.id)
            query.sid = this.id;
          var transport = new transports[name]({
            query: query,
            socket: this,
            agent: options.agent || this.agent,
            hostname: options.hostname || this.hostname,
            port: options.port || this.port,
            secure: options.secure || this.secure,
            path: options.path || this.path,
            forceJSONP: options.forceJSONP || this.forceJSONP,
            jsonp: options.jsonp || this.jsonp,
            forceBase64: options.forceBase64 || this.forceBase64,
            enablesXDR: options.enablesXDR || this.enablesXDR,
            timestampRequests: options.timestampRequests || this.timestampRequests,
            timestampParam: options.timestampParam || this.timestampParam,
            policyPort: options.policyPort || this.policyPort,
            pfx: options.pfx || this.pfx,
            key: options.key || this.key,
            passphrase: options.passphrase || this.passphrase,
            cert: options.cert || this.cert,
            ca: options.ca || this.ca,
            ciphers: options.ciphers || this.ciphers,
            rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
            perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
            extraHeaders: options.extraHeaders || this.extraHeaders,
            forceNode: options.forceNode || this.forceNode,
            localAddress: options.localAddress || this.localAddress,
            requestTimeout: options.requestTimeout || this.requestTimeout,
            protocols: options.protocols || void 0
          });
          return transport;
        };
        function clone(obj) {
          var o = {};
          for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
              o[i] = obj[i];
            }
          }
          return o;
        }
        Socket.prototype.open = function() {
          var transport;
          if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
            transport = 'websocket';
          } else if (0 === this.transports.length) {
            var self = this;
            setTimeout(function() {
              self.emit('error', 'No transports available');
            }, 0);
            return;
          } else {
            transport = this.transports[0];
          }
          this.readyState = 'opening';
          try {
            transport = this.createTransport(transport);
          } catch (e) {
            this.transports.shift();
            this.open();
            return;
          }
          transport.open();
          this.setTransport(transport);
        };
        Socket.prototype.setTransport = function(transport) {
          debug('setting transport %s', transport.name);
          var self = this;
          if (this.transport) {
            debug('clearing existing transport %s', this.transport.name);
            this.transport.removeAllListeners();
          }
          this.transport = transport;
          transport.on('drain', function() {
            self.onDrain();
          }).on('packet', function(packet) {
            self.onPacket(packet);
          }).on('error', function(e) {
            self.onError(e);
          }).on('close', function() {
            self.onClose('transport close');
          });
        };
        Socket.prototype.probe = function(name) {
          debug('probing transport "%s"', name);
          var transport = this.createTransport(name, {probe: 1});
          var failed = false;
          var self = this;
          Socket.priorWebsocketSuccess = false;
          function onTransportOpen() {
            if (self.onlyBinaryUpgrades) {
              var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
              failed = failed || upgradeLosesBinary;
            }
            if (failed)
              return;
            debug('probe transport "%s" opened', name);
            transport.send([{
              type: 'ping',
              data: 'probe'
            }]);
            transport.once('packet', function(msg) {
              if (failed)
                return;
              if ('pong' === msg.type && 'probe' === msg.data) {
                debug('probe transport "%s" pong', name);
                self.upgrading = true;
                self.emit('upgrading', transport);
                if (!transport)
                  return;
                Socket.priorWebsocketSuccess = 'websocket' === transport.name;
                debug('pausing current transport "%s"', self.transport.name);
                self.transport.pause(function() {
                  if (failed)
                    return;
                  if ('closed' === self.readyState)
                    return;
                  debug('changing transport and sending upgrade packet');
                  cleanup();
                  self.setTransport(transport);
                  transport.send([{type: 'upgrade'}]);
                  self.emit('upgrade', transport);
                  transport = null;
                  self.upgrading = false;
                  self.flush();
                });
              } else {
                debug('probe transport "%s" failed', name);
                var err = new Error('probe error');
                err.transport = transport.name;
                self.emit('upgradeError', err);
              }
            });
          }
          function freezeTransport() {
            if (failed)
              return;
            failed = true;
            cleanup();
            transport.close();
            transport = null;
          }
          function onerror(err) {
            var error = new Error('probe error: ' + err);
            error.transport = transport.name;
            freezeTransport();
            debug('probe transport "%s" failed because of error: %s', name, err);
            self.emit('upgradeError', error);
          }
          function onTransportClose() {
            onerror('transport closed');
          }
          function onclose() {
            onerror('socket closed');
          }
          function onupgrade(to) {
            if (transport && to.name !== transport.name) {
              debug('"%s" works - aborting "%s"', to.name, transport.name);
              freezeTransport();
            }
          }
          function cleanup() {
            transport.removeListener('open', onTransportOpen);
            transport.removeListener('error', onerror);
            transport.removeListener('close', onTransportClose);
            self.removeListener('close', onclose);
            self.removeListener('upgrading', onupgrade);
          }
          transport.once('open', onTransportOpen);
          transport.once('error', onerror);
          transport.once('close', onTransportClose);
          this.once('close', onclose);
          this.once('upgrading', onupgrade);
          transport.open();
        };
        Socket.prototype.onOpen = function() {
          debug('socket open');
          this.readyState = 'open';
          Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
          this.emit('open');
          this.flush();
          if ('open' === this.readyState && this.upgrade && this.transport.pause) {
            debug('starting upgrade probes');
            for (var i = 0,
                l = this.upgrades.length; i < l; i++) {
              this.probe(this.upgrades[i]);
            }
          }
        };
        Socket.prototype.onPacket = function(packet) {
          if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
            debug('socket receive: type "%s", data "%s"', packet.type, packet.data);
            this.emit('packet', packet);
            this.emit('heartbeat');
            switch (packet.type) {
              case 'open':
                this.onHandshake(JSON.parse(packet.data));
                break;
              case 'pong':
                this.setPing();
                this.emit('pong');
                break;
              case 'error':
                var err = new Error('server error');
                err.code = packet.data;
                this.onError(err);
                break;
              case 'message':
                this.emit('data', packet.data);
                this.emit('message', packet.data);
                break;
            }
          } else {
            debug('packet received with socket readyState "%s"', this.readyState);
          }
        };
        Socket.prototype.onHandshake = function(data) {
          this.emit('handshake', data);
          this.id = data.sid;
          this.transport.query.sid = data.sid;
          this.upgrades = this.filterUpgrades(data.upgrades);
          this.pingInterval = data.pingInterval;
          this.pingTimeout = data.pingTimeout;
          this.onOpen();
          if ('closed' === this.readyState)
            return;
          this.setPing();
          this.removeListener('heartbeat', this.onHeartbeat);
          this.on('heartbeat', this.onHeartbeat);
        };
        Socket.prototype.onHeartbeat = function(timeout) {
          clearTimeout(this.pingTimeoutTimer);
          var self = this;
          self.pingTimeoutTimer = setTimeout(function() {
            if ('closed' === self.readyState)
              return;
            self.onClose('ping timeout');
          }, timeout || self.pingInterval + self.pingTimeout);
        };
        Socket.prototype.setPing = function() {
          var self = this;
          clearTimeout(self.pingIntervalTimer);
          self.pingIntervalTimer = setTimeout(function() {
            debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
            self.ping();
            self.onHeartbeat(self.pingTimeout);
          }, self.pingInterval);
        };
        Socket.prototype.ping = function() {
          var self = this;
          this.sendPacket('ping', function() {
            self.emit('ping');
          });
        };
        Socket.prototype.onDrain = function() {
          this.writeBuffer.splice(0, this.prevBufferLen);
          this.prevBufferLen = 0;
          if (0 === this.writeBuffer.length) {
            this.emit('drain');
          } else {
            this.flush();
          }
        };
        Socket.prototype.flush = function() {
          if ('closed' !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
            debug('flushing %d packets in socket', this.writeBuffer.length);
            this.transport.send(this.writeBuffer);
            this.prevBufferLen = this.writeBuffer.length;
            this.emit('flush');
          }
        };
        Socket.prototype.write = Socket.prototype.send = function(msg, options, fn) {
          this.sendPacket('message', msg, options, fn);
          return this;
        };
        Socket.prototype.sendPacket = function(type, data, options, fn) {
          if ('function' === typeof data) {
            fn = data;
            data = undefined;
          }
          if ('function' === typeof options) {
            fn = options;
            options = null;
          }
          if ('closing' === this.readyState || 'closed' === this.readyState) {
            return;
          }
          options = options || {};
          options.compress = false !== options.compress;
          var packet = {
            type: type,
            data: data,
            options: options
          };
          this.emit('packetCreate', packet);
          this.writeBuffer.push(packet);
          if (fn)
            this.once('flush', fn);
          this.flush();
        };
        Socket.prototype.close = function() {
          if ('opening' === this.readyState || 'open' === this.readyState) {
            this.readyState = 'closing';
            var self = this;
            if (this.writeBuffer.length) {
              this.once('drain', function() {
                if (this.upgrading) {
                  waitForUpgrade();
                } else {
                  close();
                }
              });
            } else if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          }
          function close() {
            self.onClose('forced close');
            debug('socket closing - telling transport to close');
            self.transport.close();
          }
          function cleanupAndClose() {
            self.removeListener('upgrade', cleanupAndClose);
            self.removeListener('upgradeError', cleanupAndClose);
            close();
          }
          function waitForUpgrade() {
            self.once('upgrade', cleanupAndClose);
            self.once('upgradeError', cleanupAndClose);
          }
          return this;
        };
        Socket.prototype.onError = function(err) {
          debug('socket error %j', err);
          Socket.priorWebsocketSuccess = false;
          this.emit('error', err);
          this.onClose('transport error', err);
        };
        Socket.prototype.onClose = function(reason, desc) {
          if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
            debug('socket close with reason: "%s"', reason);
            var self = this;
            clearTimeout(this.pingIntervalTimer);
            clearTimeout(this.pingTimeoutTimer);
            this.transport.removeAllListeners('close');
            this.transport.close();
            this.transport.removeAllListeners();
            this.readyState = 'closed';
            this.id = null;
            this.emit('close', reason, desc);
            self.writeBuffer = [];
            self.prevBufferLen = 0;
          }
        };
        Socket.prototype.filterUpgrades = function(upgrades) {
          var filteredUpgrades = [];
          for (var i = 0,
              j = upgrades.length; i < j; i++) {
            if (~index(this.transports, upgrades[i]))
              filteredUpgrades.push(upgrades[i]);
          }
          return filteredUpgrades;
        };
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        'use strict';
        var XMLHttpRequest = __webpack_require__(3);
        var XHR = __webpack_require__(5);
        var JSONP = __webpack_require__(26);
        var websocket = __webpack_require__(27);
        exports.polling = polling;
        exports.websocket = websocket;
        function polling(opts) {
          var xhr;
          var xd = false;
          var xs = false;
          var jsonp = false !== opts.jsonp;
          if (global.location) {
            var isSSL = 'https:' === location.protocol;
            var port = location.port;
            if (!port) {
              port = isSSL ? 443 : 80;
            }
            xd = opts.hostname !== location.hostname || port !== opts.port;
            xs = opts.secure !== isSSL;
          }
          opts.xdomain = xd;
          opts.xscheme = xs;
          xhr = new XMLHttpRequest(opts);
          if ('open' in xhr && !opts.forceJSONP) {
            return new XHR(opts);
          } else {
            if (!jsonp)
              throw new Error('JSONP disabled');
            return new JSONP(opts);
          }
        }
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        'use strict';
        var hasCORS = __webpack_require__(4);
        module.exports = function(opts) {
          var xdomain = opts.xdomain;
          var xscheme = opts.xscheme;
          var enablesXDR = opts.enablesXDR;
          try {
            if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
              return new XMLHttpRequest();
            }
          } catch (e) {}
          try {
            if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
              return new XDomainRequest();
            }
          } catch (e) {}
          if (!xdomain) {
            try {
              return new global[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
            } catch (e) {}
          }
        };
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports) {
      try {
        module.exports = typeof XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest();
      } catch (err) {
        module.exports = false;
      }
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        'use strict';
        var XMLHttpRequest = __webpack_require__(3);
        var Polling = __webpack_require__(6);
        var Emitter = __webpack_require__(18);
        var inherit = __webpack_require__(20);
        var debug = __webpack_require__(22)('engine.io-client:polling-xhr');
        module.exports = XHR;
        module.exports.Request = Request;
        function empty() {}
        function XHR(opts) {
          Polling.call(this, opts);
          this.requestTimeout = opts.requestTimeout;
          this.extraHeaders = opts.extraHeaders;
          if (global.location) {
            var isSSL = 'https:' === location.protocol;
            var port = location.port;
            if (!port) {
              port = isSSL ? 443 : 80;
            }
            this.xd = opts.hostname !== global.location.hostname || port !== opts.port;
            this.xs = opts.secure !== isSSL;
          }
        }
        inherit(XHR, Polling);
        XHR.prototype.supportsBinary = true;
        XHR.prototype.request = function(opts) {
          opts = opts || {};
          opts.uri = this.uri();
          opts.xd = this.xd;
          opts.xs = this.xs;
          opts.agent = this.agent || false;
          opts.supportsBinary = this.supportsBinary;
          opts.enablesXDR = this.enablesXDR;
          opts.pfx = this.pfx;
          opts.key = this.key;
          opts.passphrase = this.passphrase;
          opts.cert = this.cert;
          opts.ca = this.ca;
          opts.ciphers = this.ciphers;
          opts.rejectUnauthorized = this.rejectUnauthorized;
          opts.requestTimeout = this.requestTimeout;
          opts.extraHeaders = this.extraHeaders;
          return new Request(opts);
        };
        XHR.prototype.doWrite = function(data, fn) {
          var isBinary = typeof data !== 'string' && data !== undefined;
          var req = this.request({
            method: 'POST',
            data: data,
            isBinary: isBinary
          });
          var self = this;
          req.on('success', fn);
          req.on('error', function(err) {
            self.onError('xhr post error', err);
          });
          this.sendXhr = req;
        };
        XHR.prototype.doPoll = function() {
          debug('xhr poll');
          var req = this.request();
          var self = this;
          req.on('data', function(data) {
            self.onData(data);
          });
          req.on('error', function(err) {
            self.onError('xhr poll error', err);
          });
          this.pollXhr = req;
        };
        function Request(opts) {
          this.method = opts.method || 'GET';
          this.uri = opts.uri;
          this.xd = !!opts.xd;
          this.xs = !!opts.xs;
          this.async = false !== opts.async;
          this.data = undefined !== opts.data ? opts.data : null;
          this.agent = opts.agent;
          this.isBinary = opts.isBinary;
          this.supportsBinary = opts.supportsBinary;
          this.enablesXDR = opts.enablesXDR;
          this.requestTimeout = opts.requestTimeout;
          this.pfx = opts.pfx;
          this.key = opts.key;
          this.passphrase = opts.passphrase;
          this.cert = opts.cert;
          this.ca = opts.ca;
          this.ciphers = opts.ciphers;
          this.rejectUnauthorized = opts.rejectUnauthorized;
          this.extraHeaders = opts.extraHeaders;
          this.create();
        }
        Emitter(Request.prototype);
        Request.prototype.create = function() {
          var opts = {
            agent: this.agent,
            xdomain: this.xd,
            xscheme: this.xs,
            enablesXDR: this.enablesXDR
          };
          opts.pfx = this.pfx;
          opts.key = this.key;
          opts.passphrase = this.passphrase;
          opts.cert = this.cert;
          opts.ca = this.ca;
          opts.ciphers = this.ciphers;
          opts.rejectUnauthorized = this.rejectUnauthorized;
          var xhr = this.xhr = new XMLHttpRequest(opts);
          var self = this;
          try {
            debug('xhr open %s: %s', this.method, this.uri);
            xhr.open(this.method, this.uri, this.async);
            try {
              if (this.extraHeaders) {
                xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                for (var i in this.extraHeaders) {
                  if (this.extraHeaders.hasOwnProperty(i)) {
                    xhr.setRequestHeader(i, this.extraHeaders[i]);
                  }
                }
              }
            } catch (e) {}
            if ('POST' === this.method) {
              try {
                if (this.isBinary) {
                  xhr.setRequestHeader('Content-type', 'application/octet-stream');
                } else {
                  xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
                }
              } catch (e) {}
            }
            try {
              xhr.setRequestHeader('Accept', '*/*');
            } catch (e) {}
            if ('withCredentials' in xhr) {
              xhr.withCredentials = true;
            }
            if (this.requestTimeout) {
              xhr.timeout = this.requestTimeout;
            }
            if (this.hasXDR()) {
              xhr.onload = function() {
                self.onLoad();
              };
              xhr.onerror = function() {
                self.onError(xhr.responseText);
              };
            } else {
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 2) {
                  try {
                    var contentType = xhr.getResponseHeader('Content-Type');
                    if (self.supportsBinary && contentType === 'application/octet-stream') {
                      xhr.responseType = 'arraybuffer';
                    }
                  } catch (e) {}
                }
                if (4 !== xhr.readyState)
                  return;
                if (200 === xhr.status || 1223 === xhr.status) {
                  self.onLoad();
                } else {
                  setTimeout(function() {
                    self.onError(xhr.status);
                  }, 0);
                }
              };
            }
            debug('xhr data %s', this.data);
            xhr.send(this.data);
          } catch (e) {
            setTimeout(function() {
              self.onError(e);
            }, 0);
            return;
          }
          if (global.document) {
            this.index = Request.requestsCount++;
            Request.requests[this.index] = this;
          }
        };
        Request.prototype.onSuccess = function() {
          this.emit('success');
          this.cleanup();
        };
        Request.prototype.onData = function(data) {
          this.emit('data', data);
          this.onSuccess();
        };
        Request.prototype.onError = function(err) {
          this.emit('error', err);
          this.cleanup(true);
        };
        Request.prototype.cleanup = function(fromError) {
          if ('undefined' === typeof this.xhr || null === this.xhr) {
            return;
          }
          if (this.hasXDR()) {
            this.xhr.onload = this.xhr.onerror = empty;
          } else {
            this.xhr.onreadystatechange = empty;
          }
          if (fromError) {
            try {
              this.xhr.abort();
            } catch (e) {}
          }
          if (global.document) {
            delete Request.requests[this.index];
          }
          this.xhr = null;
        };
        Request.prototype.onLoad = function() {
          var data;
          try {
            var contentType;
            try {
              contentType = this.xhr.getResponseHeader('Content-Type');
            } catch (e) {}
            if (contentType === 'application/octet-stream') {
              data = this.xhr.response || this.xhr.responseText;
            } else {
              data = this.xhr.responseText;
            }
          } catch (e) {
            this.onError(e);
          }
          if (null != data) {
            this.onData(data);
          }
        };
        Request.prototype.hasXDR = function() {
          return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
        };
        Request.prototype.abort = function() {
          this.cleanup();
        };
        Request.requestsCount = 0;
        Request.requests = {};
        if (global.document) {
          if (global.attachEvent) {
            global.attachEvent('onunload', unloadHandler);
          } else if (global.addEventListener) {
            global.addEventListener('beforeunload', unloadHandler, false);
          }
        }
        function unloadHandler() {
          for (var i in Request.requests) {
            if (Request.requests.hasOwnProperty(i)) {
              Request.requests[i].abort();
            }
          }
        }
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var Transport = __webpack_require__(7);
      var parseqs = __webpack_require__(19);
      var parser = __webpack_require__(8);
      var inherit = __webpack_require__(20);
      var yeast = __webpack_require__(21);
      var debug = __webpack_require__(22)('engine.io-client:polling');
      module.exports = Polling;
      var hasXHR2 = function() {
        var XMLHttpRequest = __webpack_require__(3);
        var xhr = new XMLHttpRequest({xdomain: false});
        return null != xhr.responseType;
      }();
      function Polling(opts) {
        var forceBase64 = opts && opts.forceBase64;
        if (!hasXHR2 || forceBase64) {
          this.supportsBinary = false;
        }
        Transport.call(this, opts);
      }
      inherit(Polling, Transport);
      Polling.prototype.name = 'polling';
      Polling.prototype.doOpen = function() {
        this.poll();
      };
      Polling.prototype.pause = function(onPause) {
        var self = this;
        this.readyState = 'pausing';
        function pause() {
          debug('paused');
          self.readyState = 'paused';
          onPause();
        }
        if (this.polling || !this.writable) {
          var total = 0;
          if (this.polling) {
            debug('we are currently polling - waiting to pause');
            total++;
            this.once('pollComplete', function() {
              debug('pre-pause polling complete');
              --total || pause();
            });
          }
          if (!this.writable) {
            debug('we are currently writing - waiting to pause');
            total++;
            this.once('drain', function() {
              debug('pre-pause writing complete');
              --total || pause();
            });
          }
        } else {
          pause();
        }
      };
      Polling.prototype.poll = function() {
        debug('polling');
        this.polling = true;
        this.doPoll();
        this.emit('poll');
      };
      Polling.prototype.onData = function(data) {
        var self = this;
        debug('polling got data %s', data);
        var callback = function callback(packet, index, total) {
          if ('opening' === self.readyState) {
            self.onOpen();
          }
          if ('close' === packet.type) {
            self.onClose();
            return false;
          }
          self.onPacket(packet);
        };
        parser.decodePayload(data, this.socket.binaryType, callback);
        if ('closed' !== this.readyState) {
          this.polling = false;
          this.emit('pollComplete');
          if ('open' === this.readyState) {
            this.poll();
          } else {
            debug('ignoring poll - transport state "%s"', this.readyState);
          }
        }
      };
      Polling.prototype.doClose = function() {
        var self = this;
        function close() {
          debug('writing close packet');
          self.write([{type: 'close'}]);
        }
        if ('open' === this.readyState) {
          debug('transport open - closing');
          close();
        } else {
          debug('transport not open - deferring close');
          this.once('open', close);
        }
      };
      Polling.prototype.write = function(packets) {
        var self = this;
        this.writable = false;
        var callbackfn = function callbackfn() {
          self.writable = true;
          self.emit('drain');
        };
        parser.encodePayload(packets, this.supportsBinary, function(data) {
          self.doWrite(data, callbackfn);
        });
      };
      Polling.prototype.uri = function() {
        var query = this.query || {};
        var schema = this.secure ? 'https' : 'http';
        var port = '';
        if (false !== this.timestampRequests) {
          query[this.timestampParam] = yeast();
        }
        if (!this.supportsBinary && !query.sid) {
          query.b64 = 1;
        }
        query = parseqs.encode(query);
        if (this.port && ('https' === schema && Number(this.port) !== 443 || 'http' === schema && Number(this.port) !== 80)) {
          port = ':' + this.port;
        }
        if (query.length) {
          query = '?' + query;
        }
        var ipv6 = this.hostname.indexOf(':') !== -1;
        return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var parser = __webpack_require__(8);
      var Emitter = __webpack_require__(18);
      module.exports = Transport;
      function Transport(opts) {
        this.path = opts.path;
        this.hostname = opts.hostname;
        this.port = opts.port;
        this.secure = opts.secure;
        this.query = opts.query;
        this.timestampParam = opts.timestampParam;
        this.timestampRequests = opts.timestampRequests;
        this.readyState = '';
        this.agent = opts.agent || false;
        this.socket = opts.socket;
        this.enablesXDR = opts.enablesXDR;
        this.pfx = opts.pfx;
        this.key = opts.key;
        this.passphrase = opts.passphrase;
        this.cert = opts.cert;
        this.ca = opts.ca;
        this.ciphers = opts.ciphers;
        this.rejectUnauthorized = opts.rejectUnauthorized;
        this.forceNode = opts.forceNode;
        this.extraHeaders = opts.extraHeaders;
        this.localAddress = opts.localAddress;
      }
      Emitter(Transport.prototype);
      Transport.prototype.onError = function(msg, desc) {
        var err = new Error(msg);
        err.type = 'TransportError';
        err.description = desc;
        this.emit('error', err);
        return this;
      };
      Transport.prototype.open = function() {
        if ('closed' === this.readyState || '' === this.readyState) {
          this.readyState = 'opening';
          this.doOpen();
        }
        return this;
      };
      Transport.prototype.close = function() {
        if ('opening' === this.readyState || 'open' === this.readyState) {
          this.doClose();
          this.onClose();
        }
        return this;
      };
      Transport.prototype.send = function(packets) {
        if ('open' === this.readyState) {
          this.write(packets);
        } else {
          throw new Error('Transport not open');
        }
      };
      Transport.prototype.onOpen = function() {
        this.readyState = 'open';
        this.writable = true;
        this.emit('open');
      };
      Transport.prototype.onData = function(data) {
        var packet = parser.decodePacket(data, this.socket.binaryType);
        this.onPacket(packet);
      };
      Transport.prototype.onPacket = function(packet) {
        this.emit('packet', packet);
      };
      Transport.prototype.onClose = function() {
        this.readyState = 'closed';
        this.emit('close');
      };
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        var keys = __webpack_require__(9);
        var hasBinary = __webpack_require__(10);
        var sliceBuffer = __webpack_require__(12);
        var after = __webpack_require__(13);
        var utf8 = __webpack_require__(14);
        var base64encoder;
        if (global && global.ArrayBuffer) {
          base64encoder = __webpack_require__(16);
        }
        var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
        var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);
        var dontSendBlobs = isAndroid || isPhantomJS;
        exports.protocol = 3;
        var packets = exports.packets = {
          open: 0,
          close: 1,
          ping: 2,
          pong: 3,
          message: 4,
          upgrade: 5,
          noop: 6
        };
        var packetslist = keys(packets);
        var err = {
          type: 'error',
          data: 'parser error'
        };
        var Blob = __webpack_require__(17);
        exports.encodePacket = function(packet, supportsBinary, utf8encode, callback) {
          if (typeof supportsBinary === 'function') {
            callback = supportsBinary;
            supportsBinary = false;
          }
          if (typeof utf8encode === 'function') {
            callback = utf8encode;
            utf8encode = null;
          }
          var data = (packet.data === undefined) ? undefined : packet.data.buffer || packet.data;
          if (global.ArrayBuffer && data instanceof ArrayBuffer) {
            return encodeArrayBuffer(packet, supportsBinary, callback);
          } else if (Blob && data instanceof global.Blob) {
            return encodeBlob(packet, supportsBinary, callback);
          }
          if (data && data.base64) {
            return encodeBase64Object(packet, callback);
          }
          var encoded = packets[packet.type];
          if (undefined !== packet.data) {
            encoded += utf8encode ? utf8.encode(String(packet.data), {strict: false}) : String(packet.data);
          }
          return callback('' + encoded);
        };
        function encodeBase64Object(packet, callback) {
          var message = 'b' + exports.packets[packet.type] + packet.data.data;
          return callback(message);
        }
        function encodeArrayBuffer(packet, supportsBinary, callback) {
          if (!supportsBinary) {
            return exports.encodeBase64Packet(packet, callback);
          }
          var data = packet.data;
          var contentArray = new Uint8Array(data);
          var resultBuffer = new Uint8Array(1 + data.byteLength);
          resultBuffer[0] = packets[packet.type];
          for (var i = 0; i < contentArray.length; i++) {
            resultBuffer[i + 1] = contentArray[i];
          }
          return callback(resultBuffer.buffer);
        }
        function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
          if (!supportsBinary) {
            return exports.encodeBase64Packet(packet, callback);
          }
          var fr = new FileReader();
          fr.onload = function() {
            packet.data = fr.result;
            exports.encodePacket(packet, supportsBinary, true, callback);
          };
          return fr.readAsArrayBuffer(packet.data);
        }
        function encodeBlob(packet, supportsBinary, callback) {
          if (!supportsBinary) {
            return exports.encodeBase64Packet(packet, callback);
          }
          if (dontSendBlobs) {
            return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
          }
          var length = new Uint8Array(1);
          length[0] = packets[packet.type];
          var blob = new Blob([length.buffer, packet.data]);
          return callback(blob);
        }
        exports.encodeBase64Packet = function(packet, callback) {
          var message = 'b' + exports.packets[packet.type];
          if (Blob && packet.data instanceof global.Blob) {
            var fr = new FileReader();
            fr.onload = function() {
              var b64 = fr.result.split(',')[1];
              callback(message + b64);
            };
            return fr.readAsDataURL(packet.data);
          }
          var b64data;
          try {
            b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
          } catch (e) {
            var typed = new Uint8Array(packet.data);
            var basic = new Array(typed.length);
            for (var i = 0; i < typed.length; i++) {
              basic[i] = typed[i];
            }
            b64data = String.fromCharCode.apply(null, basic);
          }
          message += global.btoa(b64data);
          return callback(message);
        };
        exports.decodePacket = function(data, binaryType, utf8decode) {
          if (data === undefined) {
            return err;
          }
          if (typeof data === 'string') {
            if (data.charAt(0) === 'b') {
              return exports.decodeBase64Packet(data.substr(1), binaryType);
            }
            if (utf8decode) {
              data = tryDecode(data);
              if (data === false) {
                return err;
              }
            }
            var type = data.charAt(0);
            if (Number(type) != type || !packetslist[type]) {
              return err;
            }
            if (data.length > 1) {
              return {
                type: packetslist[type],
                data: data.substring(1)
              };
            } else {
              return {type: packetslist[type]};
            }
          }
          var asArray = new Uint8Array(data);
          var type = asArray[0];
          var rest = sliceBuffer(data, 1);
          if (Blob && binaryType === 'blob') {
            rest = new Blob([rest]);
          }
          return {
            type: packetslist[type],
            data: rest
          };
        };
        function tryDecode(data) {
          try {
            data = utf8.decode(data, {strict: false});
          } catch (e) {
            return false;
          }
          return data;
        }
        exports.decodeBase64Packet = function(msg, binaryType) {
          var type = packetslist[msg.charAt(0)];
          if (!base64encoder) {
            return {
              type: type,
              data: {
                base64: true,
                data: msg.substr(1)
              }
            };
          }
          var data = base64encoder.decode(msg.substr(1));
          if (binaryType === 'blob' && Blob) {
            data = new Blob([data]);
          }
          return {
            type: type,
            data: data
          };
        };
        exports.encodePayload = function(packets, supportsBinary, callback) {
          if (typeof supportsBinary === 'function') {
            callback = supportsBinary;
            supportsBinary = null;
          }
          var isBinary = hasBinary(packets);
          if (supportsBinary && isBinary) {
            if (Blob && !dontSendBlobs) {
              return exports.encodePayloadAsBlob(packets, callback);
            }
            return exports.encodePayloadAsArrayBuffer(packets, callback);
          }
          if (!packets.length) {
            return callback('0:');
          }
          function setLengthHeader(message) {
            return message.length + ':' + message;
          }
          function encodeOne(packet, doneCallback) {
            exports.encodePacket(packet, !isBinary ? false : supportsBinary, false, function(message) {
              doneCallback(null, setLengthHeader(message));
            });
          }
          map(packets, encodeOne, function(err, results) {
            return callback(results.join(''));
          });
        };
        function map(ary, each, done) {
          var result = new Array(ary.length);
          var next = after(ary.length, done);
          var eachWithIndex = function(i, el, cb) {
            each(el, function(error, msg) {
              result[i] = msg;
              cb(error, result);
            });
          };
          for (var i = 0; i < ary.length; i++) {
            eachWithIndex(i, ary[i], next);
          }
        }
        exports.decodePayload = function(data, binaryType, callback) {
          if (typeof data !== 'string') {
            return exports.decodePayloadAsBinary(data, binaryType, callback);
          }
          if (typeof binaryType === 'function') {
            callback = binaryType;
            binaryType = null;
          }
          var packet;
          if (data === '') {
            return callback(err, 0, 1);
          }
          var length = '',
              n,
              msg;
          for (var i = 0,
              l = data.length; i < l; i++) {
            var chr = data.charAt(i);
            if (chr !== ':') {
              length += chr;
              continue;
            }
            if (length === '' || (length != (n = Number(length)))) {
              return callback(err, 0, 1);
            }
            msg = data.substr(i + 1, n);
            if (length != msg.length) {
              return callback(err, 0, 1);
            }
            if (msg.length) {
              packet = exports.decodePacket(msg, binaryType, false);
              if (err.type === packet.type && err.data === packet.data) {
                return callback(err, 0, 1);
              }
              var ret = callback(packet, i + n, l);
              if (false === ret)
                return;
            }
            i += n;
            length = '';
          }
          if (length !== '') {
            return callback(err, 0, 1);
          }
        };
        exports.encodePayloadAsArrayBuffer = function(packets, callback) {
          if (!packets.length) {
            return callback(new ArrayBuffer(0));
          }
          function encodeOne(packet, doneCallback) {
            exports.encodePacket(packet, true, true, function(data) {
              return doneCallback(null, data);
            });
          }
          map(packets, encodeOne, function(err, encodedPackets) {
            var totalLength = encodedPackets.reduce(function(acc, p) {
              var len;
              if (typeof p === 'string') {
                len = p.length;
              } else {
                len = p.byteLength;
              }
              return acc + len.toString().length + len + 2;
            }, 0);
            var resultArray = new Uint8Array(totalLength);
            var bufferIndex = 0;
            encodedPackets.forEach(function(p) {
              var isString = typeof p === 'string';
              var ab = p;
              if (isString) {
                var view = new Uint8Array(p.length);
                for (var i = 0; i < p.length; i++) {
                  view[i] = p.charCodeAt(i);
                }
                ab = view.buffer;
              }
              if (isString) {
                resultArray[bufferIndex++] = 0;
              } else {
                resultArray[bufferIndex++] = 1;
              }
              var lenStr = ab.byteLength.toString();
              for (var i = 0; i < lenStr.length; i++) {
                resultArray[bufferIndex++] = parseInt(lenStr[i]);
              }
              resultArray[bufferIndex++] = 255;
              var view = new Uint8Array(ab);
              for (var i = 0; i < view.length; i++) {
                resultArray[bufferIndex++] = view[i];
              }
            });
            return callback(resultArray.buffer);
          });
        };
        exports.encodePayloadAsBlob = function(packets, callback) {
          function encodeOne(packet, doneCallback) {
            exports.encodePacket(packet, true, true, function(encoded) {
              var binaryIdentifier = new Uint8Array(1);
              binaryIdentifier[0] = 1;
              if (typeof encoded === 'string') {
                var view = new Uint8Array(encoded.length);
                for (var i = 0; i < encoded.length; i++) {
                  view[i] = encoded.charCodeAt(i);
                }
                encoded = view.buffer;
                binaryIdentifier[0] = 0;
              }
              var len = (encoded instanceof ArrayBuffer) ? encoded.byteLength : encoded.size;
              var lenStr = len.toString();
              var lengthAry = new Uint8Array(lenStr.length + 1);
              for (var i = 0; i < lenStr.length; i++) {
                lengthAry[i] = parseInt(lenStr[i]);
              }
              lengthAry[lenStr.length] = 255;
              if (Blob) {
                var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
                doneCallback(null, blob);
              }
            });
          }
          map(packets, encodeOne, function(err, results) {
            return callback(new Blob(results));
          });
        };
        exports.decodePayloadAsBinary = function(data, binaryType, callback) {
          if (typeof binaryType === 'function') {
            callback = binaryType;
            binaryType = null;
          }
          var bufferTail = data;
          var buffers = [];
          while (bufferTail.byteLength > 0) {
            var tailArray = new Uint8Array(bufferTail);
            var isString = tailArray[0] === 0;
            var msgLength = '';
            for (var i = 1; ; i++) {
              if (tailArray[i] === 255)
                break;
              if (msgLength.length > 310) {
                return callback(err, 0, 1);
              }
              msgLength += tailArray[i];
            }
            bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
            msgLength = parseInt(msgLength);
            var msg = sliceBuffer(bufferTail, 0, msgLength);
            if (isString) {
              try {
                msg = String.fromCharCode.apply(null, new Uint8Array(msg));
              } catch (e) {
                var typed = new Uint8Array(msg);
                msg = '';
                for (var i = 0; i < typed.length; i++) {
                  msg += String.fromCharCode(typed[i]);
                }
              }
            }
            buffers.push(msg);
            bufferTail = sliceBuffer(bufferTail, msgLength);
          }
          var total = buffers.length;
          buffers.forEach(function(buffer, i) {
            callback(exports.decodePacket(buffer, binaryType, true), i, total);
          });
        };
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports) {
      module.exports = Object.keys || function keys(obj) {
        var arr = [];
        var has = Object.prototype.hasOwnProperty;
        for (var i in obj) {
          if (has.call(obj, i)) {
            arr.push(i);
          }
        }
        return arr;
      };
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        var isArray = __webpack_require__(11);
        var toString = Object.prototype.toString;
        var withNativeBlob = typeof global.Blob === 'function' || toString.call(global.Blob) === '[object BlobConstructor]';
        var withNativeFile = typeof global.File === 'function' || toString.call(global.File) === '[object FileConstructor]';
        module.exports = hasBinary;
        function hasBinary(obj) {
          if (!obj || typeof obj !== 'object') {
            return false;
          }
          if (isArray(obj)) {
            for (var i = 0,
                l = obj.length; i < l; i++) {
              if (hasBinary(obj[i])) {
                return true;
              }
            }
            return false;
          }
          if ((typeof global.Buffer === 'function' && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) || (typeof global.ArrayBuffer === 'function' && obj instanceof ArrayBuffer) || (withNativeBlob && obj instanceof Blob) || (withNativeFile && obj instanceof File)) {
            return true;
          }
          if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
            return hasBinary(obj.toJSON(), true);
          }
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
              return true;
            }
          }
          return false;
        }
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports) {
      var toString = {}.toString;
      module.exports = Array.isArray || function(arr) {
        return toString.call(arr) == '[object Array]';
      };
    }, function(module, exports) {
      module.exports = function(arraybuffer, start, end) {
        var bytes = arraybuffer.byteLength;
        start = start || 0;
        end = end || bytes;
        if (arraybuffer.slice) {
          return arraybuffer.slice(start, end);
        }
        if (start < 0) {
          start += bytes;
        }
        if (end < 0) {
          end += bytes;
        }
        if (end > bytes) {
          end = bytes;
        }
        if (start >= bytes || start >= end || bytes === 0) {
          return new ArrayBuffer(0);
        }
        var abv = new Uint8Array(arraybuffer);
        var result = new Uint8Array(end - start);
        for (var i = start,
            ii = 0; i < end; i++, ii++) {
          result[ii] = abv[i];
        }
        return result.buffer;
      };
    }, function(module, exports) {
      module.exports = after;
      function after(count, callback, err_cb) {
        var bail = false;
        err_cb = err_cb || noop;
        proxy.count = count;
        return (count === 0) ? callback() : proxy;
        function proxy(err, result) {
          if (proxy.count <= 0) {
            throw new Error('after called too many times');
          }
          --proxy.count;
          if (err) {
            bail = true;
            callback(err);
            callback = err_cb;
          } else if (proxy.count === 0 && !bail) {
            callback(null, result);
          }
        }
      }
      function noop() {}
    }, function(module, exports, __webpack_require__) {
      var __WEBPACK_AMD_DEFINE_RESULT__;
      (function(module, global) {
        ;
        (function(root) {
          var freeExports = typeof exports == 'object' && exports;
          var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;
          var freeGlobal = typeof global == 'object' && global;
          if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
            root = freeGlobal;
          }
          var stringFromCharCode = String.fromCharCode;
          function ucs2decode(string) {
            var output = [];
            var counter = 0;
            var length = string.length;
            var value;
            var extra;
            while (counter < length) {
              value = string.charCodeAt(counter++);
              if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) {
                  output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                  output.push(value);
                  counter--;
                }
              } else {
                output.push(value);
              }
            }
            return output;
          }
          function ucs2encode(array) {
            var length = array.length;
            var index = -1;
            var value;
            var output = '';
            while (++index < length) {
              value = array[index];
              if (value > 0xFFFF) {
                value -= 0x10000;
                output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                value = 0xDC00 | value & 0x3FF;
              }
              output += stringFromCharCode(value);
            }
            return output;
          }
          function checkScalarValue(codePoint, strict) {
            if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
              if (strict) {
                throw Error('Lone surrogate U+' + codePoint.toString(16).toUpperCase() + ' is not a scalar value');
              }
              return false;
            }
            return true;
          }
          function createByte(codePoint, shift) {
            return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
          }
          function encodeCodePoint(codePoint, strict) {
            if ((codePoint & 0xFFFFFF80) == 0) {
              return stringFromCharCode(codePoint);
            }
            var symbol = '';
            if ((codePoint & 0xFFFFF800) == 0) {
              symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
            } else if ((codePoint & 0xFFFF0000) == 0) {
              if (!checkScalarValue(codePoint, strict)) {
                codePoint = 0xFFFD;
              }
              symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
              symbol += createByte(codePoint, 6);
            } else if ((codePoint & 0xFFE00000) == 0) {
              symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
              symbol += createByte(codePoint, 12);
              symbol += createByte(codePoint, 6);
            }
            symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
            return symbol;
          }
          function utf8encode(string, opts) {
            opts = opts || {};
            var strict = false !== opts.strict;
            var codePoints = ucs2decode(string);
            var length = codePoints.length;
            var index = -1;
            var codePoint;
            var byteString = '';
            while (++index < length) {
              codePoint = codePoints[index];
              byteString += encodeCodePoint(codePoint, strict);
            }
            return byteString;
          }
          function readContinuationByte() {
            if (byteIndex >= byteCount) {
              throw Error('Invalid byte index');
            }
            var continuationByte = byteArray[byteIndex] & 0xFF;
            byteIndex++;
            if ((continuationByte & 0xC0) == 0x80) {
              return continuationByte & 0x3F;
            }
            throw Error('Invalid continuation byte');
          }
          function decodeSymbol(strict) {
            var byte1;
            var byte2;
            var byte3;
            var byte4;
            var codePoint;
            if (byteIndex > byteCount) {
              throw Error('Invalid byte index');
            }
            if (byteIndex == byteCount) {
              return false;
            }
            byte1 = byteArray[byteIndex] & 0xFF;
            byteIndex++;
            if ((byte1 & 0x80) == 0) {
              return byte1;
            }
            if ((byte1 & 0xE0) == 0xC0) {
              byte2 = readContinuationByte();
              codePoint = ((byte1 & 0x1F) << 6) | byte2;
              if (codePoint >= 0x80) {
                return codePoint;
              } else {
                throw Error('Invalid continuation byte');
              }
            }
            if ((byte1 & 0xF0) == 0xE0) {
              byte2 = readContinuationByte();
              byte3 = readContinuationByte();
              codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
              if (codePoint >= 0x0800) {
                return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
              } else {
                throw Error('Invalid continuation byte');
              }
            }
            if ((byte1 & 0xF8) == 0xF0) {
              byte2 = readContinuationByte();
              byte3 = readContinuationByte();
              byte4 = readContinuationByte();
              codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) | (byte3 << 0x06) | byte4;
              if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
                return codePoint;
              }
            }
            throw Error('Invalid UTF-8 detected');
          }
          var byteArray;
          var byteCount;
          var byteIndex;
          function utf8decode(byteString, opts) {
            opts = opts || {};
            var strict = false !== opts.strict;
            byteArray = ucs2decode(byteString);
            byteCount = byteArray.length;
            byteIndex = 0;
            var codePoints = [];
            var tmp;
            while ((tmp = decodeSymbol(strict)) !== false) {
              codePoints.push(tmp);
            }
            return ucs2encode(codePoints);
          }
          var utf8 = {
            'version': '2.1.2',
            'encode': utf8encode,
            'decode': utf8decode
          };
          if (true) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
              return utf8;
            }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
          } else if (freeExports && !freeExports.nodeType) {
            if (freeModule) {
              freeModule.exports = utf8;
            } else {
              var object = {};
              var hasOwnProperty = object.hasOwnProperty;
              for (var key in utf8) {
                hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
              }
            }
          } else {
            root.utf8 = utf8;
          }
        }(this));
      }.call(exports, __webpack_require__(15)(module), (function() {
        return this;
      }())));
    }, function(module, exports) {
      module.exports = function(module) {
        if (!module.webpackPolyfill) {
          module.deprecate = function() {};
          module.paths = [];
          module.children = [];
          module.webpackPolyfill = 1;
        }
        return module;
      };
    }, function(module, exports) {
      (function() {
        "use strict";
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var lookup = new Uint8Array(256);
        for (var i = 0; i < chars.length; i++) {
          lookup[chars.charCodeAt(i)] = i;
        }
        exports.encode = function(arraybuffer) {
          var bytes = new Uint8Array(arraybuffer),
              i,
              len = bytes.length,
              base64 = "";
          for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
          }
          if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + "=";
          } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + "==";
          }
          return base64;
        };
        exports.decode = function(base64) {
          var bufferLength = base64.length * 0.75,
              len = base64.length,
              i,
              p = 0,
              encoded1,
              encoded2,
              encoded3,
              encoded4;
          if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
              bufferLength--;
            }
          }
          var arraybuffer = new ArrayBuffer(bufferLength),
              bytes = new Uint8Array(arraybuffer);
          for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
          }
          return arraybuffer;
        };
      })();
    }, function(module, exports) {
      (function(global) {
        var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder || global.MSBlobBuilder || global.MozBlobBuilder;
        var blobSupported = (function() {
          try {
            var a = new Blob(['hi']);
            return a.size === 2;
          } catch (e) {
            return false;
          }
        })();
        var blobSupportsArrayBufferView = blobSupported && (function() {
          try {
            var b = new Blob([new Uint8Array([1, 2])]);
            return b.size === 2;
          } catch (e) {
            return false;
          }
        })();
        var blobBuilderSupported = BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob;
        function mapArrayBufferViews(ary) {
          for (var i = 0; i < ary.length; i++) {
            var chunk = ary[i];
            if (chunk.buffer instanceof ArrayBuffer) {
              var buf = chunk.buffer;
              if (chunk.byteLength !== buf.byteLength) {
                var copy = new Uint8Array(chunk.byteLength);
                copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
                buf = copy.buffer;
              }
              ary[i] = buf;
            }
          }
        }
        function BlobBuilderConstructor(ary, options) {
          options = options || {};
          var bb = new BlobBuilder();
          mapArrayBufferViews(ary);
          for (var i = 0; i < ary.length; i++) {
            bb.append(ary[i]);
          }
          return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
        }
        ;
        function BlobConstructor(ary, options) {
          mapArrayBufferViews(ary);
          return new Blob(ary, options || {});
        }
        ;
        module.exports = (function() {
          if (blobSupported) {
            return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
          } else if (blobBuilderSupported) {
            return BlobBuilderConstructor;
          } else {
            return undefined;
          }
        })();
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports, __webpack_require__) {
      if (true) {
        module.exports = Emitter;
      }
      function Emitter(obj) {
        if (obj)
          return mixin(obj);
      }
      ;
      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }
        return obj;
      }
      Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
        return this;
      };
      Emitter.prototype.once = function(event, fn) {
        function on() {
          this.off(event, on);
          fn.apply(this, arguments);
        }
        on.fn = fn;
        this.on(event, on);
        return this;
      };
      Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
        this._callbacks = this._callbacks || {};
        if (0 == arguments.length) {
          this._callbacks = {};
          return this;
        }
        var callbacks = this._callbacks['$' + event];
        if (!callbacks)
          return this;
        if (1 == arguments.length) {
          delete this._callbacks['$' + event];
          return this;
        }
        var cb;
        for (var i = 0; i < callbacks.length; i++) {
          cb = callbacks[i];
          if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
          }
        }
        return this;
      };
      Emitter.prototype.emit = function(event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1),
            callbacks = this._callbacks['$' + event];
        if (callbacks) {
          callbacks = callbacks.slice(0);
          for (var i = 0,
              len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }
        return this;
      };
      Emitter.prototype.listeners = function(event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks['$' + event] || [];
      };
      Emitter.prototype.hasListeners = function(event) {
        return !!this.listeners(event).length;
      };
    }, function(module, exports) {
      exports.encode = function(obj) {
        var str = '';
        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            if (str.length)
              str += '&';
            str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
          }
        }
        return str;
      };
      exports.decode = function(qs) {
        var qry = {};
        var pairs = qs.split('&');
        for (var i = 0,
            l = pairs.length; i < l; i++) {
          var pair = pairs[i].split('=');
          qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return qry;
      };
    }, function(module, exports) {
      module.exports = function(a, b) {
        var fn = function() {};
        fn.prototype = b.prototype;
        a.prototype = new fn;
        a.prototype.constructor = a;
      };
    }, function(module, exports) {
      'use strict';
      var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''),
          length = 64,
          map = {},
          seed = 0,
          i = 0,
          prev;
      function encode(num) {
        var encoded = '';
        do {
          encoded = alphabet[num % length] + encoded;
          num = Math.floor(num / length);
        } while (num > 0);
        return encoded;
      }
      function decode(str) {
        var decoded = 0;
        for (i = 0; i < str.length; i++) {
          decoded = decoded * length + map[str.charAt(i)];
        }
        return decoded;
      }
      function yeast() {
        var now = encode(+new Date());
        if (now !== prev)
          return seed = 0, prev = now;
        return now + '.' + encode(seed++);
      }
      for (; i < length; i++)
        map[alphabet[i]] = i;
      yeast.encode = encode;
      yeast.decode = decode;
      module.exports = yeast;
    }, function(module, exports, __webpack_require__) {
      (function(process) {
        exports = module.exports = __webpack_require__(24);
        exports.log = log;
        exports.formatArgs = formatArgs;
        exports.save = save;
        exports.load = load;
        exports.useColors = useColors;
        exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();
        exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
        function useColors() {
          if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
            return true;
          }
          if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
            return false;
          }
          return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) || (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) || (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) || (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
        }
        exports.formatters.j = function(v) {
          try {
            return JSON.stringify(v);
          } catch (err) {
            return '[UnexpectedJSONParseError]: ' + err.message;
          }
        };
        function formatArgs(args) {
          var useColors = this.useColors;
          args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);
          if (!useColors)
            return;
          var c = 'color: ' + this.color;
          args.splice(1, 0, c, 'color: inherit');
          var index = 0;
          var lastC = 0;
          args[0].replace(/%[a-zA-Z%]/g, function(match) {
            if ('%%' === match)
              return;
            index++;
            if ('%c' === match) {
              lastC = index;
            }
          });
          args.splice(lastC, 0, c);
        }
        function log() {
          return 'object' === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
        }
        function save(namespaces) {
          try {
            if (null == namespaces) {
              exports.storage.removeItem('debug');
            } else {
              exports.storage.debug = namespaces;
            }
          } catch (e) {}
        }
        function load() {
          var r;
          try {
            r = exports.storage.debug;
          } catch (e) {}
          if (!r && typeof process !== 'undefined' && 'env' in process) {
            r = process.env.DEBUG;
          }
          return r;
        }
        exports.enable(load());
        function localstorage() {
          try {
            return window.localStorage;
          } catch (e) {}
        }
      }.call(exports, __webpack_require__(23)));
    }, function(module, exports) {
      var process = module.exports = {};
      var cachedSetTimeout;
      var cachedClearTimeout;
      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }
      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }
      (function() {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      }());
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          return setTimeout(fun, 0);
        }
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          return clearTimeout(marker);
        }
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;
      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }
      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }
      process.nextTick = function(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function() {
        this.fun.apply(null, this.array);
      };
      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = '';
      process.versions = {};
      function noop() {}
      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;
      process.listeners = function(name) {
        return [];
      };
      process.binding = function(name) {
        throw new Error('process.binding is not supported');
      };
      process.cwd = function() {
        return '/';
      };
      process.chdir = function(dir) {
        throw new Error('process.chdir is not supported');
      };
      process.umask = function() {
        return 0;
      };
    }, function(module, exports, __webpack_require__) {
      exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
      exports.coerce = coerce;
      exports.disable = disable;
      exports.enable = enable;
      exports.enabled = enabled;
      exports.humanize = __webpack_require__(25);
      exports.instances = [];
      exports.names = [];
      exports.skips = [];
      exports.formatters = {};
      function selectColor(namespace) {
        var hash = 0,
            i;
        for (i in namespace) {
          hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
          hash |= 0;
        }
        return exports.colors[Math.abs(hash) % exports.colors.length];
      }
      function createDebug(namespace) {
        var prevTime;
        function debug() {
          if (!debug.enabled)
            return;
          var self = debug;
          var curr = +new Date();
          var ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          var args = new Array(arguments.length);
          for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i];
          }
          args[0] = exports.coerce(args[0]);
          if ('string' !== typeof args[0]) {
            args.unshift('%O');
          }
          var index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
            if (match === '%%')
              return match;
            index++;
            var formatter = exports.formatters[format];
            if ('function' === typeof formatter) {
              var val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          exports.formatArgs.call(self, args);
          var logFn = debug.log || exports.log || console.log.bind(console);
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.enabled = exports.enabled(namespace);
        debug.useColors = exports.useColors();
        debug.color = selectColor(namespace);
        debug.destroy = destroy;
        if ('function' === typeof exports.init) {
          exports.init(debug);
        }
        exports.instances.push(debug);
        return debug;
      }
      function destroy() {
        var index = exports.instances.indexOf(this);
        if (index !== -1) {
          exports.instances.splice(index, 1);
          return true;
        } else {
          return false;
        }
      }
      function enable(namespaces) {
        exports.save(namespaces);
        exports.names = [];
        exports.skips = [];
        var i;
        var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
        var len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i])
            continue;
          namespaces = split[i].replace(/\*/g, '.*?');
          if (namespaces[0] === '-') {
            exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
          } else {
            exports.names.push(new RegExp('^' + namespaces + '$'));
          }
        }
        for (i = 0; i < exports.instances.length; i++) {
          var instance = exports.instances[i];
          instance.enabled = exports.enabled(instance.namespace);
        }
      }
      function disable() {
        exports.enable('');
      }
      function enabled(name) {
        if (name[name.length - 1] === '*') {
          return true;
        }
        var i,
            len;
        for (i = 0, len = exports.skips.length; i < len; i++) {
          if (exports.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = exports.names.length; i < len; i++) {
          if (exports.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error)
          return val.stack || val.message;
        return val;
      }
    }, function(module, exports) {
      var s = 1000;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var y = d * 365.25;
      module.exports = function(val, options) {
        options = options || {};
        var type = typeof val;
        if (type === 'string' && val.length > 0) {
          return parse(val);
        } else if (type === 'number' && isNaN(val) === false) {
          return options.long ? fmtLong(val) : fmtShort(val);
        }
        throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
      };
      function parse(str) {
        str = String(str);
        if (str.length > 100) {
          return;
        }
        var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
        if (!match) {
          return;
        }
        var n = parseFloat(match[1]);
        var type = (match[2] || 'ms').toLowerCase();
        switch (type) {
          case 'years':
          case 'year':
          case 'yrs':
          case 'yr':
          case 'y':
            return n * y;
          case 'days':
          case 'day':
          case 'd':
            return n * d;
          case 'hours':
          case 'hour':
          case 'hrs':
          case 'hr':
          case 'h':
            return n * h;
          case 'minutes':
          case 'minute':
          case 'mins':
          case 'min':
          case 'm':
            return n * m;
          case 'seconds':
          case 'second':
          case 'secs':
          case 'sec':
          case 's':
            return n * s;
          case 'milliseconds':
          case 'millisecond':
          case 'msecs':
          case 'msec':
          case 'ms':
            return n;
          default:
            return undefined;
        }
      }
      function fmtShort(ms) {
        if (ms >= d) {
          return Math.round(ms / d) + 'd';
        }
        if (ms >= h) {
          return Math.round(ms / h) + 'h';
        }
        if (ms >= m) {
          return Math.round(ms / m) + 'm';
        }
        if (ms >= s) {
          return Math.round(ms / s) + 's';
        }
        return ms + 'ms';
      }
      function fmtLong(ms) {
        return plural(ms, d, 'day') || plural(ms, h, 'hour') || plural(ms, m, 'minute') || plural(ms, s, 'second') || ms + ' ms';
      }
      function plural(ms, n, name) {
        if (ms < n) {
          return;
        }
        if (ms < n * 1.5) {
          return Math.floor(ms / n) + ' ' + name;
        }
        return Math.ceil(ms / n) + ' ' + name + 's';
      }
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        'use strict';
        var Polling = __webpack_require__(6);
        var inherit = __webpack_require__(20);
        module.exports = JSONPPolling;
        var rNewline = /\n/g;
        var rEscapedNewline = /\\n/g;
        var callbacks;
        function empty() {}
        function JSONPPolling(opts) {
          Polling.call(this, opts);
          this.query = this.query || {};
          if (!callbacks) {
            if (!global.___eio)
              global.___eio = [];
            callbacks = global.___eio;
          }
          this.index = callbacks.length;
          var self = this;
          callbacks.push(function(msg) {
            self.onData(msg);
          });
          this.query.j = this.index;
          if (global.document && global.addEventListener) {
            global.addEventListener('beforeunload', function() {
              if (self.script)
                self.script.onerror = empty;
            }, false);
          }
        }
        inherit(JSONPPolling, Polling);
        JSONPPolling.prototype.supportsBinary = false;
        JSONPPolling.prototype.doClose = function() {
          if (this.script) {
            this.script.parentNode.removeChild(this.script);
            this.script = null;
          }
          if (this.form) {
            this.form.parentNode.removeChild(this.form);
            this.form = null;
            this.iframe = null;
          }
          Polling.prototype.doClose.call(this);
        };
        JSONPPolling.prototype.doPoll = function() {
          var self = this;
          var script = document.createElement('script');
          if (this.script) {
            this.script.parentNode.removeChild(this.script);
            this.script = null;
          }
          script.async = true;
          script.src = this.uri();
          script.onerror = function(e) {
            self.onError('jsonp poll error', e);
          };
          var insertAt = document.getElementsByTagName('script')[0];
          if (insertAt) {
            insertAt.parentNode.insertBefore(script, insertAt);
          } else {
            (document.head || document.body).appendChild(script);
          }
          this.script = script;
          var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);
          if (isUAgecko) {
            setTimeout(function() {
              var iframe = document.createElement('iframe');
              document.body.appendChild(iframe);
              document.body.removeChild(iframe);
            }, 100);
          }
        };
        JSONPPolling.prototype.doWrite = function(data, fn) {
          var self = this;
          if (!this.form) {
            var form = document.createElement('form');
            var area = document.createElement('textarea');
            var id = this.iframeId = 'eio_iframe_' + this.index;
            var iframe;
            form.className = 'socketio';
            form.style.position = 'absolute';
            form.style.top = '-1000px';
            form.style.left = '-1000px';
            form.target = id;
            form.method = 'POST';
            form.setAttribute('accept-charset', 'utf-8');
            area.name = 'd';
            form.appendChild(area);
            document.body.appendChild(form);
            this.form = form;
            this.area = area;
          }
          this.form.action = this.uri();
          function complete() {
            initIframe();
            fn();
          }
          function initIframe() {
            if (self.iframe) {
              try {
                self.form.removeChild(self.iframe);
              } catch (e) {
                self.onError('jsonp polling iframe removal error', e);
              }
            }
            try {
              var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
              iframe = document.createElement(html);
            } catch (e) {
              iframe = document.createElement('iframe');
              iframe.name = self.iframeId;
              iframe.src = 'javascript:0';
            }
            iframe.id = self.iframeId;
            self.form.appendChild(iframe);
            self.iframe = iframe;
          }
          initIframe();
          data = data.replace(rEscapedNewline, '\\\n');
          this.area.value = data.replace(rNewline, '\\n');
          try {
            this.form.submit();
          } catch (e) {}
          if (this.iframe.attachEvent) {
            this.iframe.onreadystatechange = function() {
              if (self.iframe.readyState === 'complete') {
                complete();
              }
            };
          } else {
            this.iframe.onload = complete;
          }
        };
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        'use strict';
        var Transport = __webpack_require__(7);
        var parser = __webpack_require__(8);
        var parseqs = __webpack_require__(19);
        var inherit = __webpack_require__(20);
        var yeast = __webpack_require__(21);
        var debug = __webpack_require__(22)('engine.io-client:websocket');
        var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
        var NodeWebSocket;
        if (typeof window === 'undefined') {
          try {
            NodeWebSocket = __webpack_require__(28);
          } catch (e) {}
        }
        var WebSocket = BrowserWebSocket;
        if (!WebSocket && typeof window === 'undefined') {
          WebSocket = NodeWebSocket;
        }
        module.exports = WS;
        function WS(opts) {
          var forceBase64 = opts && opts.forceBase64;
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
            this.ws = this.usingBrowserWebSocket ? protocols ? new WebSocket(uri, protocols) : new WebSocket(uri) : new WebSocket(uri, protocols, opts);
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
          if (this.port && ('wss' === schema && Number(this.port) !== 443 || 'ws' === schema && Number(this.port) !== 80)) {
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
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports) {}, function(module, exports) {
      var indexOf = [].indexOf;
      module.exports = function(arr, obj) {
        if (indexOf)
          return arr.indexOf(obj);
        for (var i = 0; i < arr.length; ++i) {
          if (arr[i] === obj)
            return i;
        }
        return -1;
      };
    }, function(module, exports) {
      var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
      var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'];
      module.exports = function parseuri(str) {
        var src = str,
            b = str.indexOf('['),
            e = str.indexOf(']');
        if (b != -1 && e != -1) {
          str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }
        var m = re.exec(str || ''),
            uri = {},
            i = 14;
        while (i--) {
          uri[parts[i]] = m[i] || '';
        }
        if (b != -1 && e != -1) {
          uri.source = src;
          uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
          uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
          uri.ipv6uri = true;
        }
        return uri;
      };
    }]);
  });
  ;
})(require('buffer').Buffer, require('process'));
