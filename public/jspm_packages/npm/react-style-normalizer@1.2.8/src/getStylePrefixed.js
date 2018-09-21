/* */ 
'use strict';
var toUpperFirst = require('./toUpperFirst');
var getPrefix = require('./getPrefix');
var el = require('./el');
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