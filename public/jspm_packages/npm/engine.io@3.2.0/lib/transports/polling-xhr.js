/* */ 
var Polling = require('./polling');
var util = require('util');
module.exports = XHR;
function XHR(req) {
  Polling.call(this, req);
}
util.inherits(XHR, Polling);
XHR.prototype.onRequest = function(req) {
  if ('OPTIONS' === req.method) {
    var res = req.res;
    var headers = this.headers(req);
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    res.writeHead(200, headers);
    res.end();
  } else {
    Polling.prototype.onRequest.call(this, req);
  }
};
XHR.prototype.headers = function(req, headers) {
  headers = headers || {};
  if (req.headers.origin) {
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Allow-Origin'] = req.headers.origin;
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  return Polling.prototype.headers.call(this, req, headers);
};
