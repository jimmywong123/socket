/* */ 
'use strict';
var testEventMatches = require('../eventMatches');
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
