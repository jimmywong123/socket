/* */ 
(function(Buffer) {
  'use strict';
  const safeBuffer = require('safe-buffer');
  const Buffer = safeBuffer.Buffer;
  const concat = (list, totalLength) => {
    const target = Buffer.allocUnsafe(totalLength);
    var offset = 0;
    for (var i = 0; i < list.length; i++) {
      const buf = list[i];
      buf.copy(target, offset);
      offset += buf.length;
    }
    return target;
  };
  try {
    const bufferUtil = require('bufferutil');
    module.exports = Object.assign({concat}, bufferUtil.BufferUtil || bufferUtil);
  } catch (e) {
    const mask = (source, mask, output, offset, length) => {
      for (var i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    };
    const unmask = (buffer, mask) => {
      const length = buffer.length;
      for (var i = 0; i < length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    };
    module.exports = {
      concat,
      mask,
      unmask
    };
  }
})(require('buffer').Buffer);
