/* */ 
(function(process) {
  'use strict';
  var prefixInfo = require('./prefixInfo');
  var cssPrefixFn = require('./cssPrefix');
  var HYPHENATE = require('./stringUtils/hyphenate');
  var CAMELIZE = require('./stringUtils/camelize');
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
})(require('process'));
