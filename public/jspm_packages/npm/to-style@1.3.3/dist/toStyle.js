/* */ 
"format cjs";
(function(process) {
  !function(e) {
    if ("object" == typeof exports && "undefined" != typeof module)
      module.exports = e();
    else if ("function" == typeof define && define.amd)
      define([], e);
    else {
      var f;
      "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.toStyle = e();
    }
  }(function() {
    var define,
        module,
        exports;
    return (function e(t, n, r) {
      function s(o, u) {
        if (!n[o]) {
          if (!t[o]) {
            var a = typeof require == "function" && require;
            if (!u && a)
              return a(o, !0);
            if (i)
              return i(o, !0);
            var f = new Error("Cannot find module '" + o + "'");
            throw f.code = "MODULE_NOT_FOUND", f;
          }
          var l = n[o] = {exports: {}};
          t[o][0].call(l.exports, function(e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
      }
      var i = typeof require == "function" && require;
      for (var o = 0; o < r.length; o++)
        s(r[o]);
      return s;
    })({
      1: [function(require, module, exports) {
        'use strict';
        module.exports = {
          prefixProperties: require('./src/prefixProperties'),
          cssUnitless: require('./src/cssUnitless'),
          object: require('./src/toStyleObject'),
          string: require('./src/toStyleString')
        };
      }, {
        "./src/cssUnitless": 34,
        "./src/prefixProperties": 39,
        "./src/toStyleObject": 41,
        "./src/toStyleString": 42
      }],
      2: [function(require, module, exports) {
        module.exports = {
          toLowerFirst: require('./src/toLowerFirst'),
          toUpperFirst: require('./src/toUpperFirst'),
          separate: require('./src/separate'),
          stripWhitespace: require('./src/stripWhitespace'),
          compactWhitespace: require('./src/compactWhitespace'),
          camelize: require('./src/camelize'),
          humanize: require('./src/humanize'),
          hyphenate: require('./src/hyphenate'),
          endsWith: require('./src/endsWith'),
          is: require('./src/is')
        };
      }, {
        "./src/camelize": 18,
        "./src/compactWhitespace": 19,
        "./src/endsWith": 20,
        "./src/humanize": 21,
        "./src/hyphenate": 23,
        "./src/is": 26,
        "./src/separate": 29,
        "./src/stripWhitespace": 30,
        "./src/toLowerFirst": 31,
        "./src/toUpperFirst": 32
      }],
      3: [function(require, module, exports) {
        var SLICE = Array.prototype.slice;
        var composeTwo = function(f, g) {
          return function() {
            return f(g.apply(this, arguments));
          };
        },
            curry = function(fn, n) {
              if (typeof n !== 'number') {
                n = fn.length;
              }
              function getCurryClosure(prevArgs) {
                function curryClosure() {
                  var len = arguments.length,
                      args = [].concat(prevArgs);
                  if (len) {
                    args.push.apply(args, arguments);
                  }
                  if (args.length < n) {
                    return getCurryClosure(args);
                  }
                  return fn.apply(this, args);
                }
                return curryClosure;
              }
              return getCurryClosure([]);
            },
            find = curry(function(fn, target) {
              if (typeof target.find == 'function') {
                return target.find(fn);
              }
              if (Array.isArray(target)) {
                var i = 0;
                var len = target.length;
                var it;
                for (; i < len; i++) {
                  it = target[i];
                  if (fn(it, i, target)) {
                    return it;
                  }
                }
                return;
              }
              if (typeof target == 'object') {
                var keys = Object.keys(target);
                var i = 0;
                var len = keys.length;
                var k;
                var it;
                for (; i < len; i++) {
                  k = keys[i];
                  it = target[k];
                  if (fn(it, k, target)) {
                    return it;
                  }
                }
              }
            }),
            bindFunctionsOf = function(obj) {
              Object.keys(obj).forEach(function(k) {
                if (typeof obj[k] == 'function') {
                  obj[k] = obj[k].bind(obj);
                }
              });
              return obj;
            },
            compose = function() {
              var args = arguments;
              var len = args.length;
              var i = 0;
              var f = args[0];
              while (++i < len) {
                f = composeTwo(f, args[i]);
              }
              return f;
            },
            chain = function(where, fn, secondFn) {
              var fns = [where === 'before' ? secondFn : fn, where !== 'before' ? secondFn : fn];
              return function() {
                if (where === 'before') {
                  secondFn.apply(this, arguments);
                }
                var result = fn.apply(this, arguments);
                if (where !== 'before') {
                  secondFn.apply(this, arguments);
                }
                return result;
              };
            },
            forward = function(fn, scope) {
              return fn.bind ? fn.bind(scope) : function() {
                return fn.apply(scope, arguments);
              };
            },
            once = function(fn, scope) {
              var called = false,
                  result;
              return function() {
                if (called) {
                  return result;
                }
                called = true;
                return result = fn.call(scope || this);
              };
            },
            bindArgsArray = function(fn, args) {
              return function() {
                var thisArgs = SLICE.call(args || []);
                if (arguments.length) {
                  thisArgs.push.apply(thisArgs, arguments);
                }
                return fn.apply(this, thisArgs);
              };
            },
            bindArgs = function(fn) {
              return bindArgsArray(fn, SLICE.call(arguments, 1));
            },
            lock = function(fn, scope) {
              var args = SLICE.call(arguments, 2);
              return function() {
                return fn.apply(scope, args);
              };
            },
            lockArgsArray = function(fn, args) {
              return function() {
                if (!Array.isArray(args)) {
                  args = SLICE.call(args || []);
                }
                return fn.apply(this, args);
              };
            },
            lockArgs = function(fn) {
              return lockArgsArray(fn, SLICE.call(arguments, 1));
            },
            skipArgs = function(fn, count) {
              return function() {
                var args = SLICE.call(arguments, count || 0);
                return fn.apply(this, args);
              };
            },
            intercept = function(interceptedFn, interceptingFn, withStopArg) {
              return function() {
                var args = [].from(arguments),
                    stopArg = {stop: false};
                if (withStopArg) {
                  args.push(stopArg);
                }
                var result = interceptingFn.apply(this, args);
                if (withStopArg) {
                  if (stopArg.stop === true) {
                    return result;
                  }
                } else {
                  if (result === false) {
                    return result;
                  }
                }
                return interceptedFn.apply(this, arguments);
              };
            },
            delay = function(fn, delay, scope) {
              var delayIsNumber = delay * 1 == delay;
              if (arguments.length == 2 && !delayIsNumber) {
                scope = delay;
                delay = 0;
              } else {
                if (!delayIsNumber) {
                  delay = 0;
                }
              }
              return function() {
                var self = scope || this,
                    args = arguments;
                if (delay < 0) {
                  fn.apply(self, args);
                  return;
                }
                if (delay || !setImmediate) {
                  setTimeout(function() {
                    fn.apply(self, args);
                  }, delay);
                } else {
                  setImmediate(function() {
                    fn.apply(self, args);
                  });
                }
              };
            },
            defer = function(fn, scope) {
              return delay(fn, 0, scope);
            },
            buffer = function(fn, delay, scope) {
              var timeoutId = -1;
              return function() {
                var self = scope || this,
                    args = arguments;
                if (delay < 0) {
                  fn.apply(self, args);
                  return;
                }
                var withTimeout = delay || !setImmediate,
                    clearFn = withTimeout ? clearTimeout : clearImmediate,
                    setFn = withTimeout ? setTimeout : setImmediate;
                if (timeoutId !== -1) {
                  clearFn(timeoutId);
                }
                timeoutId = setFn(function() {
                  fn.apply(self, args);
                  self = null;
                }, delay);
              };
            },
            throttle = function(fn, delay, scope) {
              var timeoutId = -1,
                  self,
                  args;
              return function() {
                self = scope || this;
                args = arguments;
                if (timeoutId !== -1) {} else {
                  timeoutId = setTimeout(function() {
                    fn.apply(self, args);
                    self = null;
                    timeoutId = -1;
                  }, delay);
                }
              };
            },
            maxArgs = function(fn, count) {
              return function() {
                return fn.apply(this, SLICE.call(arguments, 0, count));
              };
            },
            spread = function(fn, delay, scope) {
              var timeoutId = -1;
              var callCount = 0;
              var executeCount = 0;
              var nextArgs = {};
              var increaseCounter = true;
              var resultingFnUnbound;
              var resultingFn;
              resultingFn = resultingFnUnbound = function() {
                var args = arguments,
                    self = scope || this;
                if (increaseCounter) {
                  nextArgs[callCount++] = {
                    args: args,
                    scope: self
                  };
                }
                if (timeoutId !== -1) {} else {
                  timeoutId = setTimeout(function() {
                    fn.apply(self, args);
                    timeoutId = -1;
                    executeCount++;
                    if (callCount !== executeCount) {
                      resultingFn = bindArgsArray(resultingFnUnbound, nextArgs[executeCount].args).bind(nextArgs[executeCount].scope);
                      delete nextArgs[executeCount];
                      increaseCounter = false;
                      resultingFn.apply(self);
                      increaseCounter = true;
                    } else {
                      nextArgs = {};
                    }
                  }, delay);
                }
              };
              return resultingFn;
            },
            getCacheKey = function(args, cacheParamNumber) {
              if (cacheParamNumber == null) {
                cacheParamNumber = -1;
              }
              var i = 0,
                  len = Math.min(args.length, cacheParamNumber),
                  cacheKey = [],
                  it;
              for (; i < len; i++) {
                it = args[i];
                if (root.check.isPlainObject(it) || Array.isArray(it)) {
                  cacheKey.push(JSON.stringify(it));
                } else {
                  cacheKey.push(String(it));
                }
              }
              return cacheKey.join(', ');
            },
            cache = function(fn, config) {
              config = config || {};
              var bucketCache = {},
                  cache = {},
                  skipCacheParamNumber = config.skipCacheIndex,
                  cacheBucketMethod = config.cacheBucket,
                  cacheKeyBuilder = config.cacheKey,
                  cacheArgsLength = skipCacheParamNumber == null ? fn.length : skipCacheParamNumber,
                  cachingFn;
              cachingFn = function() {
                var result,
                    skipCache = skipCacheParamNumber != null ? arguments[skipCacheParamNumber] === true : false,
                    args = skipCache ? SLICE.call(arguments, 0, cacheArgsLength) : SLICE.call(arguments),
                    cacheBucketId = cacheBucketMethod != null ? typeof cacheBucketMethod == 'function' ? cacheBucketMethod() : typeof this[cacheBucketMethod] == 'function' ? this[cacheBucketMethod]() : null : null,
                    cacheObject = cacheBucketId ? bucketCache[cacheBucketId] : cache,
                    cacheKey = (cacheKeyBuilder || getCacheKey)(args, cacheArgsLength);
                if (cacheBucketId && !cacheObject) {
                  cacheObject = bucketCache[cacheBucketId] = {};
                }
                if (skipCache || cacheObject[cacheKey] == null) {
                  cacheObject[cacheKey] = result = fn.apply(this, args);
                } else {
                  result = cacheObject[cacheKey];
                }
                return result;
              };
              cachingFn.clearCache = function(bucketId) {
                if (bucketId) {
                  delete bucketCache[String(bucketId)];
                } else {
                  cache = {};
                  bucketCache = {};
                }
              };
              cachingFn.getCache = function(cacheArgs, cacheParamNumber, cacheKeyBuilder) {
                return cachingFn.getBucketCache(null, cacheArgs, cacheParamNumber, cacheKeyBuilder);
              };
              cachingFn.getBucketCache = function(bucketId, cacheArgs, cacheParamNumber, cacheKeyBuilder) {
                var cacheObject = cache,
                    cacheKey = (cacheKeyBuilder || getCacheKey)(cacheArgs, cacheParamNumber);
                if (bucketId) {
                  bucketId = String(bucketId);
                  cacheObject = bucketCache[bucketId] = bucketCache[bucketId] || {};
                }
                return cacheObject[cacheKey];
              };
              cachingFn.setCache = function(value, cacheArgs, cacheParamNumber, cacheKeyBuilder) {
                return cachingFn.setBucketCache(null, value, cacheArgs, cacheParamNumber, cacheKeyBuilder);
              };
              cachingFn.setBucketCache = function(bucketId, value, cacheArgs, cacheParamNumber, cacheKeyBuilder) {
                var cacheObject = cache,
                    cacheKey = (cacheKeyBuilder || getCacheKey)(cacheArgs, cacheParamNumber);
                if (bucketId) {
                  bucketId = String(bucketId);
                  cacheObject = bucketCache[bucketId] = bucketCache[bucketId] || {};
                }
                return cacheObject[cacheKey] = value;
              };
              return cachingFn;
            };
        module.exports = {
          map: curry(function(fn, value) {
            return value != undefined && typeof value.map ? value.map(fn) : fn(value);
          }),
          dot: curry(function(prop, value) {
            return value != undefined ? value[prop] : undefined;
          }),
          maxArgs: curry(maxArgs),
          compose: compose,
          self: function(fn) {
            return fn;
          },
          buffer: buffer,
          delay: delay,
          defer: defer,
          skipArgs: skipArgs,
          intercept: function(fn, interceptedFn, withStopArgs) {
            return intercept(interceptedFn, fn, withStopArgs);
          },
          throttle: throttle,
          spread: spread,
          chain: function(fn, where, mainFn) {
            return chain(where, mainFn, fn);
          },
          before: function(fn, otherFn) {
            return chain('before', otherFn, fn);
          },
          after: function(fn, otherFn) {
            return chain('after', otherFn, fn);
          },
          curry: curry,
          forward: forward,
          once: once,
          bindArgs: function(fn) {
            return bindArgsArray(fn, SLICE.call(arguments, 1));
          },
          bindArgsArray: bindArgsArray,
          lockArgs: function(fn) {
            return lockArgsArray(fn, SLICE.call(arguments, 1));
          },
          lockArgsArray: lockArgsArray,
          bindFunctionsOf: bindFunctionsOf,
          find: find
        };
      }, {}],
      4: [function(require, module, exports) {
        module.exports = require('./src');
      }, {"./src": 11}],
      5: [function(require, module, exports) {
        'use strict';
        var objectToString = Object.prototype.toString;
        module.exports = function(value) {
          return objectToString.apply(value) === '[object Arguments]' || !!value.callee;
        };
      }, {}],
      6: [function(require, module, exports) {
        'use strict';
        module.exports = function(value) {
          return Array.isArray(value);
        };
      }, {}],
      7: [function(require, module, exports) {
        'use strict';
        module.exports = function(value) {
          return typeof value == 'boolean';
        };
      }, {}],
      8: [function(require, module, exports) {
        'use strict';
        var objectToString = Object.prototype.toString;
        module.exports = function(value) {
          return objectToString.apply(value) === '[object Date]';
        };
      }, {}],
      9: [function(require, module, exports) {
        'use strict';
        var number = require('./number');
        module.exports = function(value) {
          return number(value) && (value === parseFloat(value, 10)) && !(value === parseInt(value, 10));
        };
      }, {"./number": 13}],
      10: [function(require, module, exports) {
        'use strict';
        var objectToString = Object.prototype.toString;
        module.exports = function(value) {
          return objectToString.apply(value) === '[object Function]';
        };
      }, {}],
      11: [function(require, module, exports) {
        'use strict';
        module.exports = {
          'numeric': require('./numeric'),
          'number': require('./number'),
          'int': require('./int'),
          'float': require('./float'),
          'string': require('./string'),
          'function': require('./function'),
          'object': require('./object'),
          'arguments': require('./arguments'),
          'boolean': require('./boolean'),
          'date': require('./date'),
          'regexp': require('./regexp'),
          'array': require('./array')
        };
      }, {
        "./arguments": 5,
        "./array": 6,
        "./boolean": 7,
        "./date": 8,
        "./float": 9,
        "./function": 10,
        "./int": 12,
        "./number": 13,
        "./numeric": 14,
        "./object": 15,
        "./regexp": 16,
        "./string": 17
      }],
      12: [function(require, module, exports) {
        'use strict';
        var number = require('./number');
        module.exports = function(value) {
          return number(value) && (value === parseInt(value, 10));
        };
      }, {"./number": 13}],
      13: [function(require, module, exports) {
        'use strict';
        module.exports = function(value) {
          return typeof value === 'number' && isFinite(value);
        };
      }, {}],
      14: [function(require, module, exports) {
        'use strict';
        module.exports = function(value) {
          return !isNaN(parseFloat(value)) && isFinite(value);
        };
      }, {}],
      15: [function(require, module, exports) {
        'use strict';
        var objectToString = Object.prototype.toString;
        module.exports = function(value) {
          return objectToString.apply(value) === '[object Object]';
        };
      }, {}],
      16: [function(require, module, exports) {
        'use strict';
        var objectToString = Object.prototype.toString;
        module.exports = function(value) {
          return objectToString.apply(value) === '[object RegExp]';
        };
      }, {}],
      17: [function(require, module, exports) {
        'use strict';
        module.exports = function(value) {
          return typeof value == 'string';
        };
      }, {}],
      18: [function(require, module, exports) {
        'use strict';
        var toCamelFn = function(str, letter) {
          return letter ? letter.toUpperCase() : '';
        };
        var hyphenRe = require('./hyphenRe');
        module.exports = function(str) {
          return str ? str.replace(hyphenRe, toCamelFn) : '';
        };
      }, {"./hyphenRe": 22}],
      19: [function(require, module, exports) {
        var RE = /\s+/g;
        module.exports = function(str) {
          if (!str) {
            return '';
          }
          return str.trim().replace(RE, ' ');
        };
      }, {}],
      20: [function(require, module, exports) {
        'use strict';
        module.exports = function(str, endsWith) {
          str += '';
          if (!str) {
            return typeof endsWith == 'string' ? !endsWith : false;
          }
          endsWith += '';
          if (str.length < endsWith.length) {
            return false;
          }
          return str.lastIndexOf(endsWith) == str.length - endsWith.length;
        };
      }, {}],
      21: [function(require, module, exports) {
        'use strict';
        var separate = require('./separate');
        var camelize = require('./camelize');
        var toUpperFirst = require('./toUpperFirst');
        var hyphenRe = require('./hyphenRe');
        function toLowerAndSpace(str, letter) {
          return letter ? ' ' + letter.toLowerCase() : ' ';
        }
        module.exports = function(name, config) {
          var str = config && config.capitalize ? separate(camelize(name), ' ') : separate(name, ' ').replace(hyphenRe, toLowerAndSpace);
          return toUpperFirst(str.trim());
        };
      }, {
        "./camelize": 18,
        "./hyphenRe": 22,
        "./separate": 29,
        "./toUpperFirst": 32
      }],
      22: [function(require, module, exports) {
        module.exports = /[-\s]+(.)?/g;
      }, {}],
      23: [function(require, module, exports) {
        'use strict';
        var separate = require('./separate');
        module.exports = function(name) {
          return separate(name).toLowerCase();
        };
      }, {"./separate": 29}],
      24: [function(require, module, exports) {
        'use strict';
        module.exports = require('./match')(/^[a-zA-Z0-9]+$/);
      }, {"./match": 27}],
      25: [function(require, module, exports) {
        'use strict';
        var regex = /^[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}$/i;
        var regex2 = /^\{[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}\}$/i;
        module.exports = function(value) {
          return regex.test(value) || regex2.test(value);
        };
      }, {}],
      26: [function(require, module, exports) {
        module.exports = {
          alphanum: require('./alphanum'),
          match: require('./match'),
          guid: require('./guid'),
          numeric: require('./numeric')
        };
      }, {
        "./alphanum": 24,
        "./guid": 25,
        "./match": 27,
        "./numeric": 28
      }],
      27: [function(require, module, exports) {
        'use strict';
        var F = require('functionally');
        module.exports = F.curry(function(re, value) {
          return !!re.test(value);
        });
      }, {"functionally": 3}],
      28: [function(require, module, exports) {
        'use strict';
        module.exports = require('i-s').numeric;
      }, {"i-s": 4}],
      29: [function(require, module, exports) {
        'use strict';
        var doubleColonRe = /::/g;
        var upperToLowerRe = /([A-Z]+)([A-Z][a-z])/g;
        var lowerToUpperRe = /([a-z\d])([A-Z])/g;
        var underscoreToDashRe = /_/g;
        module.exports = function(name, separator) {
          return name ? name.replace(doubleColonRe, '/').replace(upperToLowerRe, '$1_$2').replace(lowerToUpperRe, '$1_$2').replace(underscoreToDashRe, separator || '-') : '';
        };
      }, {}],
      30: [function(require, module, exports) {
        var RE = /\s/g;
        module.exports = function(str) {
          if (!str) {
            return '';
          }
          return str.replace(RE, '');
        };
      }, {}],
      31: [function(require, module, exports) {
        module.exports = function(str) {
          return str.length ? str.charAt(0).toLowerCase() + str.substring(1) : str;
        };
      }, {}],
      32: [function(require, module, exports) {
        'use strict';
        module.exports = function(value) {
          return value.length ? value.charAt(0).toUpperCase() + value.substring(1) : value;
        };
      }, {}],
      33: [function(require, module, exports) {
        module.exports = require('./prefixer')();
      }, {"./prefixer": 40}],
      34: [function(require, module, exports) {
        'use exports';
        module.exports = {
          'animation': 1,
          'column-count': 1,
          'columns': 1,
          'font-weight': 1,
          'opacity': 1,
          'order  ': 1,
          'z-index': 1,
          'zoom': 1,
          'flex': 1,
          'box-flex': 1,
          'transform': 1,
          'perspective': 1,
          'box-pack': 1,
          'box-align': 1,
          'colspan': 1,
          'rowspan': 1
        };
      }, {}],
      35: [function(require, module, exports) {
        'use strict';
        var objectHasOwn = Object.prototype.hasOwnProperty;
        module.exports = function(object, propertyName) {
          return objectHasOwn.call(object, propertyName);
        };
      }, {}],
      36: [function(require, module, exports) {
        'use strict';
        var objectToString = Object.prototype.toString;
        module.exports = function(v) {
          return objectToString.apply(v) === '[object Function]';
        };
      }, {}],
      37: [function(require, module, exports) {
        'use strict';
        var objectToString = Object.prototype.toString;
        module.exports = function(v) {
          return !!v && objectToString.call(v) === '[object Object]';
        };
      }, {}],
      38: [function(require, module, exports) {
        var toUpperFirst = require('ustring').toUpperFirst;
        var re = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/;
        var docStyle = typeof document == 'undefined' ? {} : document.documentElement.style;
        var prefixInfo = (function() {
          var prefix = (function() {
            for (var prop in docStyle) {
              if (re.test(prop)) {
                return prop.match(re)[0];
              }
            }
            if ('WebkitOpacity' in docStyle) {
              return 'Webkit';
            }
            if ('KhtmlOpacity' in docStyle) {
              return 'Khtml';
            }
            return '';
          })(),
              lower = prefix.toLowerCase();
          return {
            style: prefix,
            css: '-' + lower + '-',
            dom: ({
              Webkit: 'WebKit',
              ms: 'MS',
              o: 'WebKit'
            })[prefix] || toUpperFirst(prefix)
          };
        })();
        module.exports = prefixInfo;
      }, {"ustring": 2}],
      39: [function(require, module, exports) {
        module.exports = {
          'border-radius': 1,
          'border-top-left-radius': 1,
          'border-top-right-radius': 1,
          'border-bottom-left-radius': 1,
          'border-bottom-right-radius': 1,
          'box-shadow': 1,
          'order': 1,
          'flex': function(name, prefix) {
            return [prefix + 'box-flex'];
          },
          'box-flex': 1,
          'box-align': 1,
          'animation': 1,
          'animation-duration': 1,
          'animation-name': 1,
          'transition': 1,
          'transition-duration': 1,
          'transform': 1,
          'transform-style': 1,
          'transform-origin': 1,
          'backface-visibility': 1,
          'perspective': 1,
          'box-pack': 1
        };
      }, {}],
      40: [function(require, module, exports) {
        'use strict';
        var ustring = require('ustring');
        var camelize = ustring.camelize;
        var hyphenate = ustring.hyphenate;
        var toLowerFirst = ustring.toLowerFirst;
        var toUpperFirst = ustring.toUpperFirst;
        var prefixInfo = require('./prefixInfo');
        var prefixProperties = require('./prefixProperties');
        var docStyle = typeof document == 'undefined' ? {} : document.documentElement.style;
        module.exports = function(asStylePrefix) {
          return function(name, config) {
            config = config || {};
            var styleName = toLowerFirst(camelize(name)),
                cssName = hyphenate(name),
                theName = asStylePrefix ? styleName : cssName,
                thePrefix = prefixInfo.style ? asStylePrefix ? prefixInfo.style : prefixInfo.css : '';
            if (styleName in docStyle) {
              return config.asString ? theName : [theName];
            }
            var upperCased = theName,
                prefixProperty = prefixProperties[cssName],
                result = [];
            if (asStylePrefix) {
              upperCased = toUpperFirst(theName);
            }
            if (typeof prefixProperty == 'function') {
              var prefixedCss = prefixProperty(theName, thePrefix) || [];
              if (prefixedCss && !Array.isArray(prefixedCss)) {
                prefixedCss = [prefixedCss];
              }
              if (prefixedCss.length) {
                prefixedCss = prefixedCss.map(function(property) {
                  return asStylePrefix ? toLowerFirst(camelize(property)) : hyphenate(property);
                });
              }
              result = result.concat(prefixedCss);
            }
            if (thePrefix) {
              result.push(thePrefix + upperCased);
            }
            result.push(theName);
            if (config.asString || result.length == 1) {
              return result[0];
            }
            return result;
          };
        };
      }, {
        "./prefixInfo": 38,
        "./prefixProperties": 39,
        "ustring": 2
      }],
      41: [function(require, module, exports) {
        'use strict';
        var ustring = require('ustring');
        var prefixInfo = require('./prefixInfo');
        var cssPrefixFn = require('./cssPrefix');
        var HYPHENATE = ustring.hyphenate;
        var CAMELIZE = ustring.camelize;
        var HAS_OWN = require('./hasOwn');
        var IS_OBJECT = require('./isObject');
        var IS_FUNCTION = require('./isFunction');
        var applyPrefix = function(target, property, value, normalizeFn) {
          cssPrefixFn(property).forEach(function(p) {
            target[normalizeFn ? normalizeFn(p) : p] = value;
          });
        };
        var toObject = function(str) {
          str = (str || '').split(';');
          var result = {};
          str.forEach(function(item) {
            var split = item.split(':');
            if (split.length == 2) {
              result[split[0].trim()] = split[1].trim();
            }
          });
          return result;
        };
        var CONFIG = {cssUnitless: require('./cssUnitless')};
        var TO_STYLE_OBJECT = function(styles, config, prepend, result) {
          if (typeof styles == 'string') {
            styles = toObject(styles);
          }
          config = config || CONFIG;
          config.cssUnitless = config.cssUnitless || CONFIG.cssUnitless;
          result = result || {};
          var scope = config.scope || {},
              addUnits = config.addUnits != null ? config.addUnits : scope && scope.addUnits != null ? scope.addUnits : true,
              cssUnitless = (config.cssUnitless != null ? config.cssUnitless : scope ? scope.cssUnitless : null) || {},
              cssUnit = (config.cssUnit || scope ? scope.cssUnit : null) || 'px',
              prefixProperties = (config.prefixProperties || (scope ? scope.prefixProperties : null)) || {},
              camelize = config.camelize,
              normalizeFn = camelize ? CAMELIZE : HYPHENATE;
          var processed,
              styleName,
              propName,
              propValue,
              propCssUnit,
              propType,
              propIsNumber,
              fnPropValue,
              prefix;
          for (propName in styles)
            if (HAS_OWN(styles, propName)) {
              propValue = styles[propName];
              styleName = HYPHENATE(prepend ? prepend + propName : propName);
              processed = false;
              prefix = false;
              if (IS_FUNCTION(propValue)) {
                fnPropValue = propValue.call(scope || styles, propValue, propName, styleName, styles);
                if (IS_OBJECT(fnPropValue) && fnPropValue.value != null) {
                  propValue = fnPropValue.value;
                  prefix = fnPropValue.prefix;
                  styleName = fnPropValue.name ? HYPHENATE(fnPropValue.name) : styleName;
                } else {
                  propValue = fnPropValue;
                }
              }
              propType = typeof propValue;
              propIsNumber = propType == 'number' || (propType == 'string' && propValue != '' && propValue * 1 == propValue);
              if (propValue == null || styleName == null || styleName === '') {
                continue;
              }
              if (propIsNumber || propType == 'string') {
                processed = true;
              }
              if (!processed && propValue.value != null && propValue.prefix) {
                processed = true;
                prefix = propValue.prefix;
                propValue = propValue.value;
              }
              if (processed) {
                prefix = prefix || !!prefixProperties[styleName];
                if (propIsNumber) {
                  propValue = addUnits && !(styleName in cssUnitless) ? propValue + cssUnit : propValue + '';
                }
                if ((styleName == 'border' || (!styleName.indexOf('border') && !~styleName.indexOf('radius') && !~styleName.indexOf('width'))) && propIsNumber) {
                  styleName = styleName + '-width';
                }
                if (!styleName.indexOf('border-radius-')) {
                  styleName.replace(/border(-radius)(-(.*))/, function(str, radius, theRest) {
                    var positions = {
                      '-top': ['-top-left', '-top-right'],
                      '-left': ['-top-left', '-bottom-left'],
                      '-right': ['-top-right', '-bottom-right'],
                      '-bottom': ['-bottom-left', '-bottom-right']
                    };
                    if (theRest in positions) {
                      styleName = [];
                      positions[theRest].forEach(function(pos) {
                        styleName.push('border' + pos + radius);
                      });
                    } else {
                      styleName = 'border' + theRest + radius;
                    }
                  });
                  if (Array.isArray(styleName)) {
                    styleName.forEach(function(styleName) {
                      if (prefix) {
                        applyPrefix(result, styleName, propValue, normalizeFn);
                      } else {
                        result[normalizeFn(styleName)] = propValue;
                      }
                    });
                    continue;
                  }
                }
                if (prefix) {
                  applyPrefix(result, styleName, propValue, normalizeFn);
                } else {
                  result[normalizeFn(styleName)] = propValue;
                }
              } else {
                TO_STYLE_OBJECT(propValue, config, styleName + '-', result);
              }
            }
          return result;
        };
        module.exports = TO_STYLE_OBJECT;
      }, {
        "./cssPrefix": 33,
        "./cssUnitless": 34,
        "./hasOwn": 35,
        "./isFunction": 36,
        "./isObject": 37,
        "./prefixInfo": 38,
        "ustring": 2
      }],
      42: [function(require, module, exports) {
        'use strict';
        var toStyleObject = require('./toStyleObject');
        var hasOwn = require('./hasOwn');
        module.exports = function(styles, config) {
          styles = toStyleObject(styles, config);
          var result = [];
          var prop;
          for (prop in styles)
            if (hasOwn(styles, prop)) {
              result.push(prop + ': ' + styles[prop]);
            }
          return result.join('; ');
        };
      }, {
        "./hasOwn": 35,
        "./toStyleObject": 41
      }]
    }, {}, [1])(1);
  });
})(require('process'));
