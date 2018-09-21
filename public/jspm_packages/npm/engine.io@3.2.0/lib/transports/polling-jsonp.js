/* */ 
var Polling = require('./polling');
var qs = require('querystring');
var rDoubleSlashes = /\\\\n/g;
var rSlashes = /(\\)?\\n/g;
var util = require('util');
module.exports = JSONP;
function JSONP(req) {
  Polling.call(this, req);
  this.head = '___eio[' + (req._query.j || '').replace(/[^0-9]/g, '') + '](';
  this.foot = ');';
}
util.inherits(JSONP, Polling);
JSONP.prototype.onData = function(data) {
  data = qs.parse(data).d;
  if ('string' === typeof data) {
    data = data.replace(rSlashes, function(match, slashes) {
      return slashes ? match : '\n';
    });
    Polling.prototype.onData.call(this, data.replace(rDoubleSlashes, '\\n'));
  }
};
JSONP.prototype.doWrite = function(data, options, callback) {
  var js = JSON.stringify(data).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  data = this.head + js + this.foot;
  Polling.prototype.doWrite.call(this, data, options, callback);
};
