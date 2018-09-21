/* */ 
(function(Buffer) {
  var utf8 = require('./utf8');
  var hasBinary = require('has-binary2');
  var after = require('after');
  var keys = require('./keys');
  exports.protocol = 3;
  var packets = exports.packets = {
    open: 0,
    close: 1,
    ping: 2,
    pong: 3,
    message: 4,
    upgrade: 5,
    noop: 6
  };
  var packetslist = keys(packets);
  var err = {
    type: 'error',
    data: 'parser error'
  };
  exports.encodePacket = function(packet, supportsBinary, utf8encode, callback) {
    if (typeof supportsBinary === 'function') {
      callback = supportsBinary;
      supportsBinary = null;
    }
    if (typeof utf8encode === 'function') {
      callback = utf8encode;
      utf8encode = null;
    }
    if (Buffer.isBuffer(packet.data)) {
      return encodeBuffer(packet, supportsBinary, callback);
    } else if (packet.data && (packet.data.buffer || packet.data) instanceof ArrayBuffer) {
      packet.data = arrayBufferToBuffer(packet.data);
      return encodeBuffer(packet, supportsBinary, callback);
    }
    var encoded = packets[packet.type];
    if (undefined !== packet.data) {
      encoded += utf8encode ? utf8.encode(String(packet.data), {strict: false}) : String(packet.data);
    }
    return callback('' + encoded);
  };
  function encodeBuffer(packet, supportsBinary, callback) {
    if (!supportsBinary) {
      return exports.encodeBase64Packet(packet, callback);
    }
    var data = packet.data;
    var typeBuffer = new Buffer(1);
    typeBuffer[0] = packets[packet.type];
    return callback(Buffer.concat([typeBuffer, data]));
  }
  exports.encodeBase64Packet = function(packet, callback) {
    if (!Buffer.isBuffer(packet.data)) {
      packet.data = arrayBufferToBuffer(packet.data);
    }
    var message = 'b' + packets[packet.type];
    message += packet.data.toString('base64');
    return callback(message);
  };
  exports.decodePacket = function(data, binaryType, utf8decode) {
    if (data === undefined) {
      return err;
    }
    var type;
    if (typeof data === 'string') {
      type = data.charAt(0);
      if (type === 'b') {
        return exports.decodeBase64Packet(data.substr(1), binaryType);
      }
      if (utf8decode) {
        data = tryDecode(data);
        if (data === false) {
          return err;
        }
      }
      if (Number(type) != type || !packetslist[type]) {
        return err;
      }
      if (data.length > 1) {
        return {
          type: packetslist[type],
          data: data.substring(1)
        };
      } else {
        return {type: packetslist[type]};
      }
    }
    if (binaryType === 'arraybuffer') {
      var intArray = new Uint8Array(data);
      type = intArray[0];
      return {
        type: packetslist[type],
        data: intArray.buffer.slice(1)
      };
    }
    if (data instanceof ArrayBuffer) {
      data = arrayBufferToBuffer(data);
    }
    type = data[0];
    return {
      type: packetslist[type],
      data: data.slice(1)
    };
  };
  function tryDecode(data) {
    try {
      data = utf8.decode(data, {strict: false});
    } catch (e) {
      return false;
    }
    return data;
  }
  exports.decodeBase64Packet = function(msg, binaryType) {
    var type = packetslist[msg.charAt(0)];
    var data = new Buffer(msg.substr(1), 'base64');
    if (binaryType === 'arraybuffer') {
      var abv = new Uint8Array(data.length);
      for (var i = 0; i < abv.length; i++) {
        abv[i] = data[i];
      }
      data = abv.buffer;
    }
    return {
      type: type,
      data: data
    };
  };
  exports.encodePayload = function(packets, supportsBinary, callback) {
    if (typeof supportsBinary === 'function') {
      callback = supportsBinary;
      supportsBinary = null;
    }
    if (supportsBinary && hasBinary(packets)) {
      return exports.encodePayloadAsBinary(packets, callback);
    }
    if (!packets.length) {
      return callback('0:');
    }
    function encodeOne(packet, doneCallback) {
      exports.encodePacket(packet, supportsBinary, false, function(message) {
        doneCallback(null, setLengthHeader(message));
      });
    }
    map(packets, encodeOne, function(err, results) {
      return callback(results.join(''));
    });
  };
  function setLengthHeader(message) {
    return message.length + ':' + message;
  }
  function map(ary, each, done) {
    var result = new Array(ary.length);
    var next = after(ary.length, done);
    for (var i = 0; i < ary.length; i++) {
      each(ary[i], function(error, msg) {
        result[i] = msg;
        next(error, result);
      });
    }
  }
  exports.decodePayload = function(data, binaryType, callback) {
    if (typeof data !== 'string') {
      return exports.decodePayloadAsBinary(data, binaryType, callback);
    }
    if (typeof binaryType === 'function') {
      callback = binaryType;
      binaryType = null;
    }
    if (data === '') {
      return callback(err, 0, 1);
    }
    var length = '',
        n,
        msg,
        packet;
    for (var i = 0,
        l = data.length; i < l; i++) {
      var chr = data.charAt(i);
      if (chr !== ':') {
        length += chr;
        continue;
      }
      if (length === '' || (length != (n = Number(length)))) {
        return callback(err, 0, 1);
      }
      msg = data.substr(i + 1, n);
      if (length != msg.length) {
        return callback(err, 0, 1);
      }
      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, false);
        if (err.type === packet.type && err.data === packet.data) {
          return callback(err, 0, 1);
        }
        var more = callback(packet, i + n, l);
        if (false === more)
          return;
      }
      i += n;
      length = '';
    }
    if (length !== '') {
      return callback(err, 0, 1);
    }
  };
  function bufferToString(buffer) {
    var str = '';
    for (var i = 0,
        l = buffer.length; i < l; i++) {
      str += String.fromCharCode(buffer[i]);
    }
    return str;
  }
  function stringToBuffer(string) {
    var buf = new Buffer(string.length);
    for (var i = 0,
        l = string.length; i < l; i++) {
      buf.writeUInt8(string.charCodeAt(i), i);
    }
    return buf;
  }
  function arrayBufferToBuffer(data) {
    var array = new Uint8Array(data.buffer || data);
    var length = data.byteLength || data.length;
    var offset = data.byteOffset || 0;
    var buffer = new Buffer(length);
    for (var i = 0; i < length; i++) {
      buffer[i] = array[offset + i];
    }
    return buffer;
  }
  exports.encodePayloadAsBinary = function(packets, callback) {
    if (!packets.length) {
      return callback(new Buffer(0));
    }
    map(packets, encodeOneBinaryPacket, function(err, results) {
      return callback(Buffer.concat(results));
    });
  };
  function encodeOneBinaryPacket(p, doneCallback) {
    function onBinaryPacketEncode(packet) {
      var encodingLength = '' + packet.length;
      var sizeBuffer;
      if (typeof packet === 'string') {
        sizeBuffer = new Buffer(encodingLength.length + 2);
        sizeBuffer[0] = 0;
        for (var i = 0; i < encodingLength.length; i++) {
          sizeBuffer[i + 1] = parseInt(encodingLength[i], 10);
        }
        sizeBuffer[sizeBuffer.length - 1] = 255;
        return doneCallback(null, Buffer.concat([sizeBuffer, stringToBuffer(packet)]));
      }
      sizeBuffer = new Buffer(encodingLength.length + 2);
      sizeBuffer[0] = 1;
      for (var i = 0; i < encodingLength.length; i++) {
        sizeBuffer[i + 1] = parseInt(encodingLength[i], 10);
      }
      sizeBuffer[sizeBuffer.length - 1] = 255;
      doneCallback(null, Buffer.concat([sizeBuffer, packet]));
    }
    exports.encodePacket(p, true, true, onBinaryPacketEncode);
  }
  exports.decodePayloadAsBinary = function(data, binaryType, callback) {
    if (typeof binaryType === 'function') {
      callback = binaryType;
      binaryType = null;
    }
    var bufferTail = data;
    var buffers = [];
    var i;
    while (bufferTail.length > 0) {
      var strLen = '';
      var isString = bufferTail[0] === 0;
      for (i = 1; ; i++) {
        if (bufferTail[i] === 255)
          break;
        if (strLen.length > 310) {
          return callback(err, 0, 1);
        }
        strLen += '' + bufferTail[i];
      }
      bufferTail = bufferTail.slice(strLen.length + 1);
      var msgLength = parseInt(strLen, 10);
      var msg = bufferTail.slice(1, msgLength + 1);
      if (isString)
        msg = bufferToString(msg);
      buffers.push(msg);
      bufferTail = bufferTail.slice(msgLength + 1);
    }
    var total = buffers.length;
    for (i = 0; i < total; i++) {
      var buffer = buffers[i];
      callback(exports.decodePacket(buffer, binaryType, true), i, total);
    }
  };
})(require('buffer').Buffer);
