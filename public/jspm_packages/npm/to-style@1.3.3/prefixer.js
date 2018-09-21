/* */ 
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