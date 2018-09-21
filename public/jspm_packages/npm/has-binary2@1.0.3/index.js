/* */ 
(function(Buffer) {
  var isArray = require('isarray');
  var toString = Object.prototype.toString;
  var withNativeBlob = typeof Blob === 'function' || typeof Blob !== 'undefined' && toString.call(Blob) === '[object BlobConstructor]';
  var withNativeFile = typeof File === 'function' || typeof File !== 'undefined' && toString.call(File) === '[object FileConstructor]';
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
    if ((typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj)) || (typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer) || (withNativeBlob && obj instanceof Blob) || (withNativeFile && obj instanceof File)) {
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
})(require('buffer').Buffer);
