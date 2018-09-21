/* */ 
"format cjs";
(function(Buffer, process) {
  (function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
      module.exports = factory();
    else if (typeof define === 'function' && define.amd)
      define(factory);
    else if (typeof exports === 'object')
      exports["Tooltip"] = factory();
    else
      root["Tooltip"] = factory();
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
      var throttle = __webpack_require__(1);
      var targetFn = __webpack_require__(2);
      var configure = __webpack_require__(3);
      var mouseenter = __webpack_require__(4);
      var mouseleave = __webpack_require__(5);
      var TOOLTIP = function(cfg) {
        var config = configure(cfg);
        var target = targetFn(config);
        var root = config.target;
        var t = config.throttle;
        var onMouseOver = throttle(function(eventTarget) {
          target && target.set(eventTarget);
        }, t);
        var onMouseOut = throttle(function(eventTarget) {
          target && target.hold();
          setTimeout(function() {
            if (target && target.onHold()) {
              target.set(null);
            }
          }, t);
        }, t);
        var removeMouseEnter = mouseenter(root, config.selector, onMouseOver);
        var removeMouseLeave = mouseleave(root, config.selector, onMouseOut);
        return {destroy: function() {
            target.destroy();
            removeMouseEnter();
            removeMouseLeave();
            root = null;
            target = null;
            config = null;
          }};
      };
      module.exports = TOOLTIP;
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function(fn, delay, scope) {
        var timeoutId = -1;
        var self;
        var args;
        if (delay === undefined) {
          delay = 0;
        }
        if (delay < 0) {
          return fn;
        }
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
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var Region = __webpack_require__(15);
      var assign = __webpack_require__(13);
      var escape = __webpack_require__(14);
      var setStyle = __webpack_require__(7);
      var toOffset = __webpack_require__(8);
      var parseAsStyle = __webpack_require__(9);
      var tooltipElement = __webpack_require__(10);
      var preparePositions = __webpack_require__(6);
      var mapObject = __webpack_require__(11);
      function emptyObject(obj) {
        return mapObject(obj, function() {
          return '';
        });
      }
      module.exports = function(config) {
        var prevStyle;
        function showTooltip(target) {
          var tooltip = target.getAttribute(config.attrName);
          var el = tooltipElement(config);
          el.innerHTML = config.escape ? escape(tooltip) : tooltip;
          var positions = config.alignPositions;
          var elRegion = Region.from(el);
          var targetRegion = Region.from(target);
          var attrPosition = target.getAttribute(config.attrName + '-positions');
          var attrStyle = target.getAttribute(config.attrName + '-style');
          var style = assign({}, prevStyle, config.style);
          if (attrStyle) {
            attrStyle = parseAsStyle(attrStyle);
            prevStyle = emptyObject(attrStyle);
            assign(style, attrStyle);
          }
          if (attrPosition) {
            positions = preparePositions(attrPosition.split(';'));
          }
          var res = elRegion.alignTo(targetRegion, positions, {
            offset: toOffset(config.offset, positions),
            constrain: true
          });
          setStyle(el, style, config.visibleStyle, {
            top: elRegion.top,
            left: elRegion.left
          });
        }
        function clearTooltip() {
          setStyle(tooltipElement(config), config.hiddenStyle);
        }
        var withTarget = (function() {
          var currentTarget;
          var prevId;
          return function(target) {
            if (target != currentTarget) {
              if (prevId) {
                clearTimeout(prevId);
                prevId = null;
              }
              if (target) {
                if (config.showDelay) {
                  prevId = setTimeout(function() {
                    prevId = null;
                    showTooltip(target);
                  }, config.showDelay);
                } else {
                  showTooltip(target);
                }
              } else {
                clearTooltip();
              }
            }
            currentTarget = target;
          };
        })();
        var setter = (function() {
          var lastValue;
          var PREV_ID;
          return function setter(value) {
            if (value == lastValue) {
              return;
            }
            lastValue = value;
            if (config.hideOnChange) {
              if (PREV_ID || value) {
                if (PREV_ID) {
                  clearTimeout(PREV_ID);
                }
                PREV_ID = setTimeout(function() {
                  PREV_ID = null;
                  withTarget(lastValue);
                }, config.hideOnChangeDelay);
              }
              value = null;
            }
            withTarget(value);
          };
        })();
        var HOLD = false;
        return {
          destroy: function() {
            tooltipElement.destroy(config);
          },
          hold: function() {
            HOLD = true;
          },
          onHold: function() {
            return HOLD;
          },
          set: function(value) {
            HOLD = false;
            setter(value);
          }
        };
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var assign = __webpack_require__(13);
      var clone = __webpack_require__(16);
      var DEFAULT = {
        attrName: 'data-tooltip',
        throttle: 10,
        showDelay: 500,
        offset: {
          x: 5,
          y: 5
        },
        hideOnChange: true,
        hideOnChangeDelay: 500,
        className: 'tooltip',
        style: {
          padding: 5,
          border: '1px solid gray',
          background: 'white',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          position: 'absolute',
          visibility: 'hidden',
          display: 'inline-block',
          transform: 'translate3d(0px, 0px, 0px)',
          transition: 'opacity 0.3s'
        },
        visibleStyle: {
          opacity: 1,
          visibility: 'visible'
        },
        hiddenStyle: {opacity: 0}
      };
      var preparePositions = __webpack_require__(6);
      var id = 0;
      module.exports = function(values) {
        values = values || {};
        var style = assign({}, DEFAULT.style, values.style);
        var visibleStyle = assign({}, DEFAULT.visibleStyle, values.visibleStyle);
        var hiddenStyle = assign({}, DEFAULT.hiddenStyle, values.hiddenStyle);
        var config = clone(assign({}, DEFAULT, values));
        config.style = style;
        config.visibleStyle = visibleStyle;
        config.hiddenStyle = hiddenStyle;
        config.selector = '[' + config.attrName + ']';
        config.alignPositions = preparePositions(config.alignPositions);
        config.target = config.target || document.documentElement;
        config.id = id++;
        return config;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var testEventMatches = __webpack_require__(12);
      function returnTrue() {
        return true;
      }
      function contains(haystack, needle) {
        var targ = needle;
        while (targ && targ !== haystack) {
          targ = targ.parentNode;
        }
        return targ !== haystack;
      }
      module.exports = function(el, selector, fn, config) {
        var eventMatches = testEventMatches(el, selector);
        var onMouseOver = function(event) {
          var target = event.target;
          var related = event.relatedTarget;
          var match;
          if (match = eventMatches(event)) {
            fn(match, event);
          }
        };
        el.addEventListener('mouseover', onMouseOver);
        return function() {
          el.removeEventListener('mouseover', onMouseOver);
        };
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var testEventMatches = __webpack_require__(12);
      function returnTrue() {
        return true;
      }
      function contains(haystack, needle) {
        var targ = needle;
        while (targ && targ !== haystack) {
          targ = targ.parentNode;
        }
        return targ !== haystack;
      }
      module.exports = function(el, selector, fn, config) {
        var has = config && config.allowNested ? returnTrue : contains;
        var eventMatches = testEventMatches(el, selector);
        var onMouseOut = function(event) {
          var target = event.target;
          var related = event.relatedTarget;
          var match;
          if (!related || (related !== target && has(target, related))) {
            if (match = eventMatches(event)) {
              fn(match, event);
            }
          }
        };
        el.addEventListener('mouseout', onMouseOut);
        return function() {
          el.removeEventListener('mouseout', onMouseOut);
        };
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var TRANSLATE_POS = {
        top: 'bc-tc',
        bottom: 'tc-bc',
        left: 'rc-lc',
        right: 'lc-rc',
        topleft: 'br-tl',
        topright: 'bl-tr',
        bottomleft: 'tr-bl',
        bottomright: 'tl-br'
      };
      module.exports = function preparePositions(positions) {
        positions = positions || ['topleft', 'topright', 'bottomleft', 'bottomright', 'top', 'bottom'];
        return positions.map(function(pos) {
          pos = pos.trim();
          return TRANSLATE_POS[pos] || pos;
        }).filter(function(pos) {
          return !!pos;
        });
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var toStyleObject = __webpack_require__(17).object;
      var normalize = __webpack_require__(22);
      function setOneStyle(element, style) {
        style = toStyleObject(normalize(style));
        Object.keys(style).forEach(function(key) {
          element.style[key] = style[key];
        });
        return element;
      }
      module.exports = function(element, style) {
        var args = [].slice.call(arguments, 1);
        args.forEach(function(style) {
          setOneStyle(element, style);
        });
        return element;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var signs = {
        t: {
          x: 1,
          y: 1
        },
        l: {
          x: 1,
          y: 1
        },
        b: {
          x: 1,
          y: -1
        },
        r: {
          x: -1,
          y: 1
        }
      };
      module.exports = function(offset, positions) {
        if (!offset) {
          return;
        }
        var array;
        if (Array.isArray(offset)) {
          array = offset;
        }
        array = offset.x != undefined ? [offset.x, offset.y] : [offset.left, offset.top];
        var x = array[0];
        var y = array[1];
        return positions.map(function(pos) {
          var parts = pos.split('-');
          var first = parts[0];
          var side1 = first[0];
          var side2 = first[1];
          var sign1 = signs[side1];
          var sign2 = signs[side2];
          var xSign = 1;
          var ySign = 1;
          if (sign1) {
            xSign *= sign1.x;
            ySign *= sign1.y;
          }
          if (sign2) {
            xSign *= sign2.x;
            ySign *= sign2.y;
          }
          return [x * xSign, y * ySign];
        });
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function(str) {
        var result = {};
        str.split(';').forEach(function(style) {
          var parts = style.split(':');
          if (parts.length) {
            result[parts[0].trim()] = parts[1].trim();
          }
        });
        return result;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var setStyle = __webpack_require__(7);
      var map = {};
      var result = function(config) {
        var element = map[config.id];
        if (!element) {
          element = setStyle(document.createElement('div'), config.style || {});
          element.className = config.className;
          document.body.appendChild(element);
          map[config.id] = element;
        }
        return element;
      };
      result.destroy = function(config) {
        var element = map[config.id];
        if (element) {
          var parent = element.parentNode;
          parent && parent.removeChild(element);
        }
      };
      module.exports = result;
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function mapObject(obj, fn) {
        var result = {};
        Object.keys(obj).forEach(function(key) {
          result[key] = fn(obj[key]);
        });
        return result;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var matches = __webpack_require__(21);
      module.exports = function(root, selector) {
        return function(event) {
          var target = event.target;
          while (target) {
            if (matches(target, selector)) {
              return target;
            }
            if (target == root) {
              return;
            }
            target = target.parentNode;
          }
        };
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var propIsEnumerable = Object.prototype.propertyIsEnumerable;
      function ToObject(val) {
        if (val == null) {
          throw new TypeError('Object.assign cannot be called with null or undefined');
        }
        return Object(val);
      }
      function ownEnumerableKeys(obj) {
        var keys = Object.getOwnPropertyNames(obj);
        if (Object.getOwnPropertySymbols) {
          keys = keys.concat(Object.getOwnPropertySymbols(obj));
        }
        return keys.filter(function(key) {
          return propIsEnumerable.call(obj, key);
        });
      }
      module.exports = Object.assign || function(target, source) {
        var from;
        var keys;
        var to = ToObject(target);
        for (var s = 1; s < arguments.length; s++) {
          from = arguments[s];
          keys = ownEnumerableKeys(Object(from));
          for (var i = 0; i < keys.length; i++) {
            to[keys[i]] = from[keys[i]];
          }
        }
        return to;
      };
    }, function(module, exports, __webpack_require__) {
      module.exports = escapeHtml;
      function escapeHtml(html) {
        return String(html).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var Region = __webpack_require__(23);
      __webpack_require__(18);
      __webpack_require__(19);
      var COMPUTE_ALIGN_REGION = __webpack_require__(20);
      Region.alignRegions = function(sourceRegion, targetRegion, positions, config) {
        var result = COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config);
        var alignedRegion = result.region;
        if (!alignedRegion.equals(sourceRegion)) {
          sourceRegion.setRegion(alignedRegion);
        }
        return result.position;
      };
      Region.prototype.alignTo = function(target, positions, config) {
        config = config || {};
        var sourceRegion = this;
        var targetRegion = Region.from(target);
        var result = COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config);
        var resultRegion = result.region;
        if (!resultRegion.equalsSize(sourceRegion)) {
          this.setSize(resultRegion.getSize());
        }
        if (!resultRegion.equalsPosition(sourceRegion)) {
          this.setPosition(resultRegion.getPosition(), {absolute: !!config.absolute});
        }
        return result.position;
      };
      module.exports = Region;
    }, function(module, exports, __webpack_require__) {
      var clone = (function() {
        'use strict';
        function clone(parent, circular, depth, prototype) {
          var filter;
          if (typeof circular === 'object') {
            depth = circular.depth;
            prototype = circular.prototype;
            filter = circular.filter;
            circular = circular.circular;
          }
          var allParents = [];
          var allChildren = [];
          var useBuffer = typeof Buffer != 'undefined';
          if (typeof circular == 'undefined')
            circular = true;
          if (typeof depth == 'undefined')
            depth = Infinity;
          function _clone(parent, depth) {
            if (parent === null)
              return null;
            if (depth == 0)
              return parent;
            var child;
            var proto;
            if (typeof parent != 'object') {
              return parent;
            }
            if (clone.__isArray(parent)) {
              child = [];
            } else if (clone.__isRegExp(parent)) {
              child = new RegExp(parent.source, __getRegExpFlags(parent));
              if (parent.lastIndex)
                child.lastIndex = parent.lastIndex;
            } else if (clone.__isDate(parent)) {
              child = new Date(parent.getTime());
            } else if (useBuffer && Buffer.isBuffer(parent)) {
              child = new Buffer(parent.length);
              parent.copy(child);
              return child;
            } else {
              if (typeof prototype == 'undefined') {
                proto = Object.getPrototypeOf(parent);
                child = Object.create(proto);
              } else {
                child = Object.create(prototype);
                proto = prototype;
              }
            }
            if (circular) {
              var index = allParents.indexOf(parent);
              if (index != -1) {
                return allChildren[index];
              }
              allParents.push(parent);
              allChildren.push(child);
            }
            for (var i in parent) {
              var attrs;
              if (proto) {
                attrs = Object.getOwnPropertyDescriptor(proto, i);
              }
              if (attrs && attrs.set == null) {
                continue;
              }
              child[i] = _clone(parent[i], depth - 1);
            }
            return child;
          }
          return _clone(parent, depth);
        }
        clone.clonePrototype = function clonePrototype(parent) {
          if (parent === null)
            return null;
          var c = function() {};
          c.prototype = parent;
          return new c();
        };
        function __objToStr(o) {
          return Object.prototype.toString.call(o);
        }
        ;
        clone.__objToStr = __objToStr;
        function __isDate(o) {
          return typeof o === 'object' && __objToStr(o) === '[object Date]';
        }
        ;
        clone.__isDate = __isDate;
        function __isArray(o) {
          return typeof o === 'object' && __objToStr(o) === '[object Array]';
        }
        ;
        clone.__isArray = __isArray;
        function __isRegExp(o) {
          return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
        }
        ;
        clone.__isRegExp = __isRegExp;
        function __getRegExpFlags(re) {
          var flags = '';
          if (re.global)
            flags += 'g';
          if (re.ignoreCase)
            flags += 'i';
          if (re.multiline)
            flags += 'm';
          return flags;
        }
        ;
        clone.__getRegExpFlags = __getRegExpFlags;
        return clone;
      })();
      if (typeof module === 'object' && module.exports) {
        module.exports = clone;
      }
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = {
        prefixProperties: __webpack_require__(24),
        cssUnitless: __webpack_require__(25),
        object: __webpack_require__(26),
        string: __webpack_require__(27)
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var Region = __webpack_require__(23);
      Region.align = function(sourceRegion, targetRegion, align) {
        targetRegion = Region.from(targetRegion);
        align = (align || 'c-c').split('-');
        if (align.length != 2) {
          console.warn('Incorrect region alignment! The align parameter need to be in the form \'br-c\', that is, a - separated string!', align);
        }
        return Region.alignToPoint(sourceRegion, targetRegion.getPoint(align[1]), align[0]);
      };
      Region.alignToPoint = function(region, point, anchor) {
        region = Region.from(region);
        var sourcePoint = region.getPoint(anchor);
        var count = 0;
        var shiftObj = {};
        if (sourcePoint.x != null && point.x != null) {
          count++;
          shiftObj.left = point.x - sourcePoint.x;
        }
        if (sourcePoint.y != null && point.y != null) {
          count++;
          shiftObj.top = point.y - sourcePoint.y;
        }
        if (count) {
          region.shift(shiftObj);
        }
        return region;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var Region = __webpack_require__(23);
      Region.prototype.alignToRegion = function(region, alignPositions) {
        Region.align(this, region, alignPositions);
        return this;
      };
      Region.prototype.alignToPoint = function(point, anchor) {
        Region.alignToPoint(this, point, anchor);
        return this;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var ALIGN_TO_NORMALIZED = __webpack_require__(28);
      var Region = __webpack_require__(23);
      function COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config) {
        sourceRegion = Region.from(sourceRegion);
        var sourceClone = sourceRegion.clone();
        var position = ALIGN_TO_NORMALIZED(sourceClone, targetRegion, positions, config);
        return {
          position: position,
          region: sourceClone,
          widthChanged: sourceClone.getWidth() != sourceRegion.getWidth(),
          heightChanged: sourceClone.getHeight() != sourceRegion.getHeight(),
          positionChanged: sourceClone.equalsPosition(sourceRegion)
        };
      }
      module.exports = COMPUTE_ALIGN_REGION;
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var proto = Element.prototype;
      var vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;
      module.exports = match;
      function match(el, selector) {
        if (vendor)
          return vendor.call(el, selector);
        var nodes = el.parentNode.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] == el)
            return true;
        }
        return false;
      }
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var hasOwn = __webpack_require__(29);
      var getPrefixed = __webpack_require__(30);
      var map = __webpack_require__(31);
      var plugable = __webpack_require__(32);
      function plugins(key, value) {
        var result = {
          key: key,
          value: value
        };
        ;
        (RESULT.plugins || []).forEach(function(fn) {
          var tmp = map(function(res) {
            return fn(key, value, res);
          }, result);
          if (tmp) {
            result = tmp;
          }
        });
        return result;
      }
      function normalize(key, value) {
        var result = plugins(key, value);
        return map(function(result) {
          return {
            key: getPrefixed(result.key, result.value),
            value: result.value
          };
        }, result);
        return result;
      }
      var RESULT = function(style) {
        var k;
        var item;
        var result = {};
        for (k in style)
          if (hasOwn(style, k)) {
            item = normalize(k, style[k]);
            if (!item) {
              continue;
            }
            map(function(item) {
              result[item.key] = item.value;
            }, item);
          }
        return result;
      };
      module.exports = plugable(RESULT);
    }, function(module, exports, __webpack_require__) {
      module.exports = __webpack_require__(33);
    }, function(module, exports, __webpack_require__) {
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
    }, function(module, exports, __webpack_require__) {
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
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var prefixInfo = __webpack_require__(35);
      var cssPrefixFn = __webpack_require__(36);
      var HYPHENATE = __webpack_require__(37);
      var CAMELIZE = __webpack_require__(38);
      var HAS_OWN = __webpack_require__(34);
      var IS_OBJECT = __webpack_require__(39);
      var IS_FUNCTION = __webpack_require__(40);
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
      var CONFIG = {cssUnitless: __webpack_require__(25)};
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
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var toStyleObject = __webpack_require__(26);
      var hasOwn = __webpack_require__(34);
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
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var Region = __webpack_require__(23);
      function ALIGN_TO_NORMALIZED(sourceRegion, targetRegion, positions, config) {
        targetRegion = Region.from(targetRegion);
        config = config || {};
        var constrainTo = config.constrain,
            syncOption = config.sync,
            offsets = config.offset || [],
            syncWidth = false,
            syncHeight = false,
            sourceClone = sourceRegion.clone();
        if (!Array.isArray(positions)) {
          positions = positions ? [positions] : [];
        }
        if (!Array.isArray(offsets)) {
          offsets = offsets ? [offsets] : [];
        }
        if (constrainTo) {
          constrainTo = constrainTo === true ? Region.getDocRegion() : constrainTo.getRegion();
        }
        if (syncOption) {
          if (syncOption.size) {
            syncWidth = true;
            syncHeight = true;
          } else {
            syncWidth = syncOption === true ? true : syncOption.width || false;
            syncHeight = syncOption === true ? true : syncOption.height || false;
          }
        }
        if (syncWidth) {
          sourceClone.setWidth(targetRegion.getWidth());
        }
        if (syncHeight) {
          sourceClone.setHeight(targetRegion.getHeight());
        }
        var offset,
            i = 0,
            len = positions.length,
            pos,
            intersection,
            itArea,
            maxArea = -1,
            maxAreaIndex = -1;
        for (; i < len; i++) {
          pos = positions[i];
          offset = offsets[i];
          sourceClone.alignToRegion(targetRegion, pos);
          if (offset) {
            if (!Array.isArray(offset)) {
              offset = offsets[i] = [offset.x || offset.left, offset.y || offset.top];
            }
            sourceClone.shift({
              left: offset[0],
              top: offset[1]
            });
          }
          if (constrainTo) {
            intersection = sourceClone.getIntersection(constrainTo);
            if (intersection && intersection.equals(sourceClone)) {
              sourceRegion.set(sourceClone);
              return pos;
            } else {
              if (intersection && ((itArea = intersection.getArea()) > maxArea)) {
                maxArea = itArea;
                maxAreaIndex = i;
              }
            }
          } else {
            sourceRegion.set(sourceClone);
            return pos;
          }
        }
        if (~maxAreaIndex) {
          pos = positions[maxAreaIndex];
          offset = offsets[maxAreaIndex];
          sourceClone.alignToRegion(targetRegion, pos);
          if (offset) {
            sourceClone.shift({
              left: offset[0],
              top: offset[1]
            });
          }
          intersection = sourceClone.getIntersection(constrainTo);
          sourceClone.setRegion(intersection);
          sourceClone.alignToRegion(targetRegion, pos);
          if (offset) {
            sourceClone.shift({
              left: offset[0],
              top: offset[1]
            });
          }
          sourceRegion.set(sourceClone);
          return pos;
        }
      }
      module.exports = ALIGN_TO_NORMALIZED;
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var getStylePrefixed = __webpack_require__(41);
      var properties = __webpack_require__(42);
      module.exports = function(key, value) {
        if (!properties[key]) {
          return key;
        }
        return getStylePrefixed(key, value);
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function(fn, item) {
        if (!item) {
          return;
        }
        if (Array.isArray(item)) {
          return item.map(fn).filter(function(x) {
            return !!x;
          });
        } else {
          return fn(item);
        }
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var getCssPrefixedValue = __webpack_require__(43);
      module.exports = function(target) {
        target.plugins = target.plugins || [(function() {
          var values = {
            'flex': 1,
            'inline-flex': 1
          };
          return function(key, value) {
            if (key === 'display' && value in values) {
              return {
                key: key,
                value: getCssPrefixedValue(key, value, true)
              };
            }
          };
        })()];
        target.plugin = function(fn) {
          target.plugins = target.plugins || [];
          target.plugins.push(fn);
        };
        return target;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var hasOwn = __webpack_require__(56);
      var newify = __webpack_require__(57);
      var assign = __webpack_require__(58);
      var EventEmitter = __webpack_require__(54).EventEmitter;
      var inherits = __webpack_require__(44);
      var VALIDATE = __webpack_require__(45);
      var objectToString = Object.prototype.toString;
      var isObject = function(value) {
        return objectToString.apply(value) === '[object Object]';
      };
      function copyList(source, target, list) {
        if (source) {
          list.forEach(function(key) {
            if (hasOwn(source, key)) {
              target[key] = source[key];
            }
          });
        }
        return target;
      }
      var POINT_POSITIONS = {
        cy: 'YCenter',
        cx: 'XCenter',
        t: 'Top',
        tc: 'TopCenter',
        tl: 'TopLeft',
        tr: 'TopRight',
        b: 'Bottom',
        bc: 'BottomCenter',
        bl: 'BottomLeft',
        br: 'BottomRight',
        l: 'Left',
        lc: 'LeftCenter',
        r: 'Right',
        rc: 'RightCenter',
        c: 'Center'
      };
      var REGION = function(top, right, bottom, left) {
        if (!(this instanceof REGION)) {
          return newify(REGION, arguments);
        }
        EventEmitter.call(this);
        if (isObject(top)) {
          copyList(top, this, ['top', 'right', 'bottom', 'left']);
          if (top.bottom == null && top.height != null) {
            this.bottom = this.top + top.height;
          }
          if (top.right == null && top.width != null) {
            this.right = this.left + top.width;
          }
          if (top.emitChangeEvents) {
            this.emitChangeEvents = top.emitChangeEvents;
          }
        } else {
          this.top = top;
          this.right = right;
          this.bottom = bottom;
          this.left = left;
        }
        this[0] = this.left;
        this[1] = this.top;
        VALIDATE(this);
      };
      inherits(REGION, EventEmitter);
      assign(REGION.prototype, {
        emitChangeEvents: false,
        getRegion: function(clone) {
          return clone ? this.clone() : this;
        },
        setRegion: function(reg) {
          if (reg instanceof REGION) {
            this.set(reg.get());
          } else {
            this.set(reg);
          }
          return this;
        },
        validate: function() {
          return REGION.validate(this);
        },
        _before: function() {
          if (this.emitChangeEvents) {
            return copyList(this, {}, ['left', 'top', 'bottom', 'right']);
          }
        },
        _after: function(before) {
          if (this.emitChangeEvents) {
            if (this.top != before.top || this.left != before.left) {
              this.emitPositionChange();
            }
            if (this.right != before.right || this.bottom != before.bottom) {
              this.emitSizeChange();
            }
          }
        },
        notifyPositionChange: function() {
          this.emit('changeposition', this);
        },
        emitPositionChange: function() {
          this.notifyPositionChange();
        },
        notifySizeChange: function() {
          this.emit('changesize', this);
        },
        emitSizeChange: function() {
          this.notifySizeChange();
        },
        add: function(directions) {
          var before = this._before();
          var direction;
          for (direction in directions)
            if (hasOwn(directions, direction)) {
              this[direction] += directions[direction];
            }
          this[0] = this.left;
          this[1] = this.top;
          this._after(before);
          return this;
        },
        substract: function(directions) {
          var before = this._before();
          var direction;
          for (direction in directions)
            if (hasOwn(directions, direction)) {
              this[direction] -= directions[direction];
            }
          this[0] = this.left;
          this[1] = this.top;
          this._after(before);
          return this;
        },
        getSize: function() {
          return {
            width: this.width,
            height: this.height
          };
        },
        setPosition: function(position) {
          var width = this.width;
          var height = this.height;
          if (position.left != undefined) {
            position.right = position.left + width;
          }
          if (position.top != undefined) {
            position.bottom = position.top + height;
          }
          return this.set(position);
        },
        setSize: function(size) {
          if (size.height != undefined && size.width != undefined) {
            return this.set({
              right: this.left + size.width,
              bottom: this.top + size.height
            });
          }
          if (size.width != undefined) {
            this.setWidth(size.width);
          }
          if (size.height != undefined) {
            this.setHeight(size.height);
          }
          return this;
        },
        setWidth: function(width) {
          return this.set({right: this.left + width});
        },
        setHeight: function(height) {
          return this.set({bottom: this.top + height});
        },
        set: function(directions) {
          var before = this._before();
          copyList(directions, this, ['left', 'top', 'bottom', 'right']);
          if (directions.bottom == null && directions.height != null) {
            this.bottom = this.top + directions.height;
          }
          if (directions.right == null && directions.width != null) {
            this.right = this.left + directions.width;
          }
          this[0] = this.left;
          this[1] = this.top;
          this._after(before);
          return this;
        },
        get: function(dir) {
          return dir ? this[dir] : copyList(this, {}, ['left', 'right', 'top', 'bottom']);
        },
        shift: function(directions) {
          var before = this._before();
          if (directions.top) {
            this.top += directions.top;
            this.bottom += directions.top;
          }
          if (directions.left) {
            this.left += directions.left;
            this.right += directions.left;
          }
          this[0] = this.left;
          this[1] = this.top;
          this._after(before);
          return this;
        },
        unshift: function(directions) {
          if (directions.top) {
            directions.top *= -1;
          }
          if (directions.left) {
            directions.left *= -1;
          }
          return this.shift(directions);
        },
        equals: function(region) {
          return this.equalsPosition(region) && this.equalsSize(region);
        },
        equalsSize: function(size) {
          var isInstance = size instanceof REGION;
          var s = {
            width: size.width == null && isInstance ? size.getWidth() : size.width,
            height: size.height == null && isInstance ? size.getHeight() : size.height
          };
          return this.getWidth() == s.width && this.getHeight() == s.height;
        },
        equalsPosition: function(region) {
          return this.top == region.top && this.left == region.left;
        },
        addLeft: function(left) {
          var before = this._before();
          this.left = this[0] = this.left + left;
          this._after(before);
          return this;
        },
        addTop: function(top) {
          var before = this._before();
          this.top = this[1] = this.top + top;
          this._after(before);
          return this;
        },
        addBottom: function(bottom) {
          var before = this._before();
          this.bottom += bottom;
          this._after(before);
          return this;
        },
        addRight: function(right) {
          var before = this._before();
          this.right += right;
          this._after(before);
          return this;
        },
        minTop: function() {
          return this.expand({top: 1});
        },
        maxBottom: function() {
          return this.expand({bottom: 1});
        },
        minLeft: function() {
          return this.expand({left: 1});
        },
        maxRight: function() {
          return this.expand({right: 1});
        },
        expand: function(directions, region) {
          var docRegion = region || REGION.getDocRegion();
          var list = [];
          var direction;
          var before = this._before();
          for (direction in directions)
            if (hasOwn(directions, direction)) {
              list.push(direction);
            }
          copyList(docRegion, this, list);
          this[0] = this.left;
          this[1] = this.top;
          this._after(before);
          return this;
        },
        clone: function() {
          return new REGION({
            top: this.top,
            left: this.left,
            right: this.right,
            bottom: this.bottom
          });
        },
        containsPoint: function(x, y) {
          if (arguments.length == 1) {
            y = x.y;
            x = x.x;
          }
          return this.left <= x && x <= this.right && this.top <= y && y <= this.bottom;
        },
        containsRegion: function(region) {
          return this.containsPoint(region.left, region.top) && this.containsPoint(region.right, region.bottom);
        },
        diffHeight: function(region) {
          return this.diff(region, {
            top: true,
            bottom: true
          });
        },
        diffWidth: function(region) {
          return this.diff(region, {
            left: true,
            right: true
          });
        },
        diff: function(region, directions) {
          var result = {};
          var dirName;
          for (dirName in directions)
            if (hasOwn(directions, dirName)) {
              result[dirName] = this[dirName] - region[dirName];
            }
          return result;
        },
        getPosition: function() {
          return {
            left: this.left,
            top: this.top
          };
        },
        getPoint: function(position, asLeftTop) {
          if (!POINT_POSITIONS[position]) {
            console.warn('The position ', position, ' could not be found! Available options are tl, bl, tr, br, l, r, t, b.');
          }
          var method = 'getPoint' + POINT_POSITIONS[position],
              result = this[method]();
          if (asLeftTop) {
            return {
              left: result.x,
              top: result.y
            };
          }
          return result;
        },
        getPointYCenter: function() {
          return {
            x: null,
            y: this.top + this.getHeight() / 2
          };
        },
        getPointXCenter: function() {
          return {
            x: this.left + this.getWidth() / 2,
            y: null
          };
        },
        getPointTop: function() {
          return {
            x: null,
            y: this.top
          };
        },
        getPointTopCenter: function() {
          return {
            x: this.left + this.getWidth() / 2,
            y: this.top
          };
        },
        getPointTopLeft: function() {
          return {
            x: this.left,
            y: this.top
          };
        },
        getPointTopRight: function() {
          return {
            x: this.right,
            y: this.top
          };
        },
        getPointBottom: function() {
          return {
            x: null,
            y: this.bottom
          };
        },
        getPointBottomCenter: function() {
          return {
            x: this.left + this.getWidth() / 2,
            y: this.bottom
          };
        },
        getPointBottomLeft: function() {
          return {
            x: this.left,
            y: this.bottom
          };
        },
        getPointBottomRight: function() {
          return {
            x: this.right,
            y: this.bottom
          };
        },
        getPointLeft: function() {
          return {
            x: this.left,
            y: null
          };
        },
        getPointLeftCenter: function() {
          return {
            x: this.left,
            y: this.top + this.getHeight() / 2
          };
        },
        getPointRight: function() {
          return {
            x: this.right,
            y: null
          };
        },
        getPointRightCenter: function() {
          return {
            x: this.right,
            y: this.top + this.getHeight() / 2
          };
        },
        getPointCenter: function() {
          return {
            x: this.left + this.getWidth() / 2,
            y: this.top + this.getHeight() / 2
          };
        },
        getHeight: function() {
          return this.bottom - this.top;
        },
        getWidth: function() {
          return this.right - this.left;
        },
        getTop: function() {
          return this.top;
        },
        getLeft: function() {
          return this.left;
        },
        getBottom: function() {
          return this.bottom;
        },
        getRight: function() {
          return this.right;
        },
        getArea: function() {
          return this.getWidth() * this.getHeight();
        },
        constrainTo: function(contrain) {
          var intersect = this.getIntersection(contrain);
          var shift;
          if (!intersect || !intersect.equals(this)) {
            var contrainWidth = contrain.getWidth(),
                contrainHeight = contrain.getHeight();
            if (this.getWidth() > contrainWidth) {
              this.left = contrain.left;
              this.setWidth(contrainWidth);
            }
            if (this.getHeight() > contrainHeight) {
              this.top = contrain.top;
              this.setHeight(contrainHeight);
            }
            shift = {};
            if (this.right > contrain.right) {
              shift.left = contrain.right - this.right;
            }
            if (this.bottom > contrain.bottom) {
              shift.top = contrain.bottom - this.bottom;
            }
            if (this.left < contrain.left) {
              shift.left = contrain.left - this.left;
            }
            if (this.top < contrain.top) {
              shift.top = contrain.top - this.top;
            }
            this.shift(shift);
            return true;
          }
          return false;
        },
        __IS_REGION: true
      });
      Object.defineProperties(REGION.prototype, {
        width: {
          get: function() {
            return this.getWidth();
          },
          set: function(width) {
            return this.setWidth(width);
          }
        },
        height: {
          get: function() {
            return this.getHeight();
          },
          set: function(height) {
            return this.setHeight(height);
          }
        }
      });
      __webpack_require__(46)(REGION);
      module.exports = REGION;
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var objectHasOwn = Object.prototype.hasOwnProperty;
      module.exports = function(object, propertyName) {
        return objectHasOwn.call(object, propertyName);
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var toUpperFirst = __webpack_require__(50);
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
    }, function(module, exports, __webpack_require__) {
      module.exports = __webpack_require__(48)();
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var separate = __webpack_require__(47);
      module.exports = function(name) {
        return separate(name).toLowerCase();
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var toCamelFn = function(str, letter) {
        return letter ? letter.toUpperCase() : '';
      };
      var hyphenRe = __webpack_require__(49);
      module.exports = function(str) {
        return str ? str.replace(hyphenRe, toCamelFn) : '';
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var objectToString = Object.prototype.toString;
      module.exports = function(v) {
        return !!v && objectToString.call(v) === '[object Object]';
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var objectToString = Object.prototype.toString;
      module.exports = function(v) {
        return objectToString.apply(v) === '[object Function]';
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var toUpperFirst = __webpack_require__(51);
      var getPrefix = __webpack_require__(52);
      var el = __webpack_require__(53);
      var MEMORY = {};
      var STYLE;
      var ELEMENT;
      var PREFIX;
      module.exports = function(key, value) {
        ELEMENT = ELEMENT || el();
        STYLE = STYLE || ELEMENT.style;
        var k = key;
        if (MEMORY[k]) {
          return MEMORY[k];
        }
        var prefix;
        var prefixed;
        if (!(key in STYLE)) {
          prefix = getPrefix('appearance');
          if (prefix) {
            prefixed = prefix + toUpperFirst(key);
            if (prefixed in STYLE) {
              key = prefixed;
            }
          }
        }
        MEMORY[k] = key;
        return key;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = {
        'alignItems': 1,
        'justifyContent': 1,
        'flex': 1,
        'flexFlow': 1,
        'flexGrow': 1,
        'flexShrink': 1,
        'flexBasis': 1,
        'flexDirection': 1,
        'flexWrap': 1,
        'alignContent': 1,
        'alignSelf': 1,
        'userSelect': 1,
        'transform': 1,
        'transition': 1,
        'transformOrigin': 1,
        'transformStyle': 1,
        'transitionProperty': 1,
        'transitionDuration': 1,
        'transitionTimingFunction': 1,
        'transitionDelay': 1,
        'borderImage': 1,
        'borderImageSlice': 1,
        'boxShadow': 1,
        'backgroundClip': 1,
        'backfaceVisibility': 1,
        'perspective': 1,
        'perspectiveOrigin': 1,
        'animation': 1,
        'animationDuration': 1,
        'animationName': 1,
        'animationDelay': 1,
        'animationDirection': 1,
        'animationIterationCount': 1,
        'animationTimingFunction': 1,
        'animationPlayState': 1,
        'animationFillMode': 1,
        'appearance': 1
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var getPrefix = __webpack_require__(52);
      var forcePrefixed = __webpack_require__(55);
      var el = __webpack_require__(53);
      var MEMORY = {};
      var STYLE;
      var ELEMENT;
      module.exports = function(key, value, force) {
        ELEMENT = ELEMENT || el();
        STYLE = STYLE || ELEMENT.style;
        var k = key + ': ' + value;
        if (MEMORY[k]) {
          return MEMORY[k];
        }
        var prefix;
        var prefixed;
        var prefixedValue;
        if (force || !(key in STYLE)) {
          prefix = getPrefix('appearance');
          if (prefix) {
            prefixed = forcePrefixed(key, value);
            prefixedValue = '-' + prefix.toLowerCase() + '-' + value;
            if (prefixed in STYLE) {
              ELEMENT.style[prefixed] = '';
              ELEMENT.style[prefixed] = prefixedValue;
              if (ELEMENT.style[prefixed] !== '') {
                value = prefixedValue;
              }
            }
          }
        }
        MEMORY[k] = value;
        return value;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }});
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function validate(region) {
        var isValid = true;
        if (region.right < region.left) {
          isValid = false;
          region.right = region.left;
        }
        if (region.bottom < region.top) {
          isValid = false;
          region.bottom = region.top;
        }
        return isValid;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var hasOwn = __webpack_require__(56);
      var VALIDATE = __webpack_require__(45);
      module.exports = function(REGION) {
        var MAX = Math.max;
        var MIN = Math.min;
        var statics = {
          init: function() {
            var exportAsNonStatic = {
              getIntersection: true,
              getIntersectionArea: true,
              getIntersectionHeight: true,
              getIntersectionWidth: true,
              getUnion: true
            };
            var thisProto = REGION.prototype;
            var newName;
            var exportHasOwn = hasOwn(exportAsNonStatic);
            var methodName;
            for (methodName in exportAsNonStatic)
              if (exportHasOwn(methodName)) {
                newName = exportAsNonStatic[methodName];
                if (typeof newName != 'string') {
                  newName = methodName;
                }
                ;
                (function(proto, methodName, protoMethodName) {
                  proto[methodName] = function(region) {
                    if (!REGION[protoMethodName]) {
                      console.warn('cannot find method ', protoMethodName, ' on ', REGION);
                    }
                    return REGION[protoMethodName](this, region);
                  };
                })(thisProto, newName, methodName);
              }
          },
          validate: VALIDATE,
          getDocRegion: function() {
            return REGION.fromDOM(document.documentElement);
          },
          from: function(reg) {
            if (reg.__IS_REGION) {
              return reg;
            }
            if (typeof document != 'undefined') {
              if (typeof HTMLElement != 'undefined' && reg instanceof HTMLElement) {
                return REGION.fromDOM(reg);
              }
              if (reg.type && typeof reg.pageX !== 'undefined' && typeof reg.pageY !== 'undefined') {
                return REGION.fromEvent(reg);
              }
            }
            return REGION(reg);
          },
          fromEvent: function(event) {
            return REGION.fromPoint({
              x: event.pageX,
              y: event.pageY
            });
          },
          fromDOM: function(dom) {
            var rect = dom.getBoundingClientRect();
            return new REGION({
              top: rect.top,
              left: rect.left,
              bottom: rect.bottom,
              right: rect.right
            });
          },
          getIntersection: function(first, second) {
            var area = this.getIntersectionArea(first, second);
            if (area) {
              return new REGION(area);
            }
            return false;
          },
          getIntersectionWidth: function(first, second) {
            var minRight = MIN(first.right, second.right);
            var maxLeft = MAX(first.left, second.left);
            if (maxLeft < minRight) {
              return minRight - maxLeft;
            }
            return 0;
          },
          getIntersectionHeight: function(first, second) {
            var maxTop = MAX(first.top, second.top);
            var minBottom = MIN(first.bottom, second.bottom);
            if (maxTop < minBottom) {
              return minBottom - maxTop;
            }
            return 0;
          },
          getIntersectionArea: function(first, second) {
            var maxTop = MAX(first.top, second.top);
            var minRight = MIN(first.right, second.right);
            var minBottom = MIN(first.bottom, second.bottom);
            var maxLeft = MAX(first.left, second.left);
            if (maxTop < minBottom && maxLeft < minRight) {
              return {
                top: maxTop,
                right: minRight,
                bottom: minBottom,
                left: maxLeft,
                width: minRight - maxLeft,
                height: minBottom - maxTop
              };
            }
            return false;
          },
          getUnion: function(first, second) {
            var top = MIN(first.top, second.top);
            var right = MAX(first.right, second.right);
            var bottom = MAX(first.bottom, second.bottom);
            var left = MIN(first.left, second.left);
            return new REGION(top, right, bottom, left);
          },
          getRegion: function(reg) {
            return REGION.from(reg);
          },
          fromPoint: function(xy) {
            return new REGION({
              top: xy.y,
              bottom: xy.y,
              left: xy.x,
              right: xy.x
            });
          }
        };
        Object.keys(statics).forEach(function(key) {
          REGION[key] = statics[key];
        });
        REGION.init();
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var doubleColonRe = /::/g;
      var upperToLowerRe = /([A-Z]+)([A-Z][a-z])/g;
      var lowerToUpperRe = /([a-z\d])([A-Z])/g;
      var underscoreToDashRe = /_/g;
      module.exports = function(name, separator) {
        return name ? name.replace(doubleColonRe, '/').replace(upperToLowerRe, '$1_$2').replace(lowerToUpperRe, '$1_$2').replace(underscoreToDashRe, separator || '-') : '';
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var camelize = __webpack_require__(38);
      var hyphenate = __webpack_require__(37);
      var toLowerFirst = __webpack_require__(59);
      var toUpperFirst = __webpack_require__(50);
      var prefixInfo = __webpack_require__(35);
      var prefixProperties = __webpack_require__(24);
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
    }, function(module, exports, __webpack_require__) {
      module.exports = /[-\s]+(.)?/g;
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function(value) {
        return value.length ? value.charAt(0).toUpperCase() + value.substring(1) : value;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var toUpperFirst = __webpack_require__(51);
      var prefixes = ["ms", "Moz", "Webkit", "O"];
      var el = __webpack_require__(53);
      var ELEMENT;
      var PREFIX;
      module.exports = function(key) {
        if (PREFIX !== undefined) {
          return PREFIX;
        }
        ELEMENT = ELEMENT || el();
        var i = 0;
        var len = prefixes.length;
        var tmp;
        var prefix;
        for (; i < len; i++) {
          prefix = prefixes[i];
          tmp = prefix + toUpperFirst(key);
          if (typeof ELEMENT.style[tmp] != 'undefined') {
            return PREFIX = prefix;
          }
        }
        return PREFIX;
      };
    }, function(module, exports, __webpack_require__) {
      (function(global) {
        'use strict';
        var el;
        module.exports = function() {
          if (!el && !!global.document) {
            el = global.document.createElement('div');
          }
          if (!el) {
            el = {style: {}};
          }
          return el;
        };
      }.call(exports, (function() {
        return this;
      }())));
    }, function(module, exports, __webpack_require__) {
      function EventEmitter() {
        this._events = this._events || {};
        this._maxListeners = this._maxListeners || undefined;
      }
      module.exports = EventEmitter;
      EventEmitter.EventEmitter = EventEmitter;
      EventEmitter.prototype._events = undefined;
      EventEmitter.prototype._maxListeners = undefined;
      EventEmitter.defaultMaxListeners = 10;
      EventEmitter.prototype.setMaxListeners = function(n) {
        if (!isNumber(n) || n < 0 || isNaN(n))
          throw TypeError('n must be a positive number');
        this._maxListeners = n;
        return this;
      };
      EventEmitter.prototype.emit = function(type) {
        var er,
            handler,
            len,
            args,
            i,
            listeners;
        if (!this._events)
          this._events = {};
        if (type === 'error') {
          if (!this._events.error || (isObject(this._events.error) && !this._events.error.length)) {
            er = arguments[1];
            if (er instanceof Error) {
              throw er;
            }
            throw TypeError('Uncaught, unspecified "error" event.');
          }
        }
        handler = this._events[type];
        if (isUndefined(handler))
          return false;
        if (isFunction(handler)) {
          switch (arguments.length) {
            case 1:
              handler.call(this);
              break;
            case 2:
              handler.call(this, arguments[1]);
              break;
            case 3:
              handler.call(this, arguments[1], arguments[2]);
              break;
            default:
              len = arguments.length;
              args = new Array(len - 1);
              for (i = 1; i < len; i++)
                args[i - 1] = arguments[i];
              handler.apply(this, args);
          }
        } else if (isObject(handler)) {
          len = arguments.length;
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          listeners = handler.slice();
          len = listeners.length;
          for (i = 0; i < len; i++)
            listeners[i].apply(this, args);
        }
        return true;
      };
      EventEmitter.prototype.addListener = function(type, listener) {
        var m;
        if (!isFunction(listener))
          throw TypeError('listener must be a function');
        if (!this._events)
          this._events = {};
        if (this._events.newListener)
          this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
        if (!this._events[type])
          this._events[type] = listener;
        else if (isObject(this._events[type]))
          this._events[type].push(listener);
        else
          this._events[type] = [this._events[type], listener];
        if (isObject(this._events[type]) && !this._events[type].warned) {
          var m;
          if (!isUndefined(this._maxListeners)) {
            m = this._maxListeners;
          } else {
            m = EventEmitter.defaultMaxListeners;
          }
          if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
            if (typeof console.trace === 'function') {
              console.trace();
            }
          }
        }
        return this;
      };
      EventEmitter.prototype.on = EventEmitter.prototype.addListener;
      EventEmitter.prototype.once = function(type, listener) {
        if (!isFunction(listener))
          throw TypeError('listener must be a function');
        var fired = false;
        function g() {
          this.removeListener(type, g);
          if (!fired) {
            fired = true;
            listener.apply(this, arguments);
          }
        }
        g.listener = listener;
        this.on(type, g);
        return this;
      };
      EventEmitter.prototype.removeListener = function(type, listener) {
        var list,
            position,
            length,
            i;
        if (!isFunction(listener))
          throw TypeError('listener must be a function');
        if (!this._events || !this._events[type])
          return this;
        list = this._events[type];
        length = list.length;
        position = -1;
        if (list === listener || (isFunction(list.listener) && list.listener === listener)) {
          delete this._events[type];
          if (this._events.removeListener)
            this.emit('removeListener', type, listener);
        } else if (isObject(list)) {
          for (i = length; i-- > 0; ) {
            if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
              position = i;
              break;
            }
          }
          if (position < 0)
            return this;
          if (list.length === 1) {
            list.length = 0;
            delete this._events[type];
          } else {
            list.splice(position, 1);
          }
          if (this._events.removeListener)
            this.emit('removeListener', type, listener);
        }
        return this;
      };
      EventEmitter.prototype.removeAllListeners = function(type) {
        var key,
            listeners;
        if (!this._events)
          return this;
        if (!this._events.removeListener) {
          if (arguments.length === 0)
            this._events = {};
          else if (this._events[type])
            delete this._events[type];
          return this;
        }
        if (arguments.length === 0) {
          for (key in this._events) {
            if (key === 'removeListener')
              continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = {};
          return this;
        }
        listeners = this._events[type];
        if (isFunction(listeners)) {
          this.removeListener(type, listeners);
        } else {
          while (listeners.length)
            this.removeListener(type, listeners[listeners.length - 1]);
        }
        delete this._events[type];
        return this;
      };
      EventEmitter.prototype.listeners = function(type) {
        var ret;
        if (!this._events || !this._events[type])
          ret = [];
        else if (isFunction(this._events[type]))
          ret = [this._events[type]];
        else
          ret = this._events[type].slice();
        return ret;
      };
      EventEmitter.listenerCount = function(emitter, type) {
        var ret;
        if (!emitter._events || !emitter._events[type])
          ret = 0;
        else if (isFunction(emitter._events[type]))
          ret = 1;
        else
          ret = emitter._events[type].length;
        return ret;
      };
      function isFunction(arg) {
        return typeof arg === 'function';
      }
      function isNumber(arg) {
        return typeof arg === 'number';
      }
      function isObject(arg) {
        return typeof arg === 'object' && arg !== null;
      }
      function isUndefined(arg) {
        return arg === void 0;
      }
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var toUpperFirst = __webpack_require__(51);
      var getPrefix = __webpack_require__(52);
      var properties = __webpack_require__(42);
      module.exports = function(key, value) {
        if (!properties[key]) {
          return key;
        }
        var prefix = getPrefix(key);
        return prefix ? prefix + toUpperFirst(key) : key;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      var hasOwn = Object.prototype.hasOwnProperty;
      function curry(fn, n) {
        if (typeof n !== 'number') {
          n = fn.length;
        }
        function getCurryClosure(prevArgs) {
          function curryClosure() {
            var len = arguments.length;
            var args = [].concat(prevArgs);
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
      }
      module.exports = curry(function(object, property) {
        return hasOwn.call(object, property);
      });
    }, function(module, exports, __webpack_require__) {
      var getInstantiatorFunction = __webpack_require__(60);
      module.exports = function(fn, args) {
        return getInstantiatorFunction(args.length)(fn, args);
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      function ToObject(val) {
        if (val == null) {
          throw new TypeError('Object.assign cannot be called with null or undefined');
        }
        return Object(val);
      }
      module.exports = Object.assign || function(target, source) {
        var from;
        var keys;
        var to = ToObject(target);
        for (var s = 1; s < arguments.length; s++) {
          from = arguments[s];
          keys = Object.keys(Object(from));
          for (var i = 0; i < keys.length; i++) {
            to[keys[i]] = from[keys[i]];
          }
        }
        return to;
      };
    }, function(module, exports, __webpack_require__) {
      'use strict';
      module.exports = function(value) {
        return value.length ? value.charAt(0).toLowerCase() + value.substring(1) : value;
      };
    }, function(module, exports, __webpack_require__) {
      module.exports = function() {
        'use strict';
        var fns = {};
        return function(len) {
          if (!fns[len]) {
            var args = [];
            var i = 0;
            for (; i < len; i++) {
              args.push('a[' + i + ']');
            }
            fns[len] = new Function('c', 'a', 'return new c(' + args.join(',') + ')');
          }
          return fns[len];
        };
      }();
    }]);
  });
})(require('buffer').Buffer, require('process'));
