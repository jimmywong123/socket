/* */ 
'use strict';
var toUpperFirst = require('./toUpperFirst');
var getPrefix = require('./getPrefix');
var properties = require('./prefixProps');
module.exports = function(key, value) {
  if (!properties[key]) {
    return key;
  }
  var prefix = getPrefix(key);
  return prefix ? prefix + toUpperFirst(key) : key;
};
