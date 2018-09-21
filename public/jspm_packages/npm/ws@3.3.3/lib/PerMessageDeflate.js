/* */ 
(function(Buffer, process) {
  'use strict';
  const safeBuffer = require('safe-buffer');
  const Limiter = require('async-limiter');
  const zlib = require('zlib');
  const bufferUtil = require('./BufferUtil');
  const Buffer = safeBuffer.Buffer;
  const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
  const EMPTY_BLOCK = Buffer.from([0x00]);
  const kWriteInProgress = Symbol('write-in-progress');
  const kPendingClose = Symbol('pending-close');
  const kTotalLength = Symbol('total-length');
  const kCallback = Symbol('callback');
  const kBuffers = Symbol('buffers');
  const kError = Symbol('error');
  const kOwner = Symbol('owner');
  let zlibLimiter;
  class PerMessageDeflate {
    constructor(options, isServer, maxPayload) {
      this._maxPayload = maxPayload | 0;
      this._options = options || {};
      this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
      this._isServer = !!isServer;
      this._deflate = null;
      this._inflate = null;
      this.params = null;
      if (!zlibLimiter) {
        const concurrency = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
        zlibLimiter = new Limiter({concurrency});
      }
    }
    static get extensionName() {
      return 'permessage-deflate';
    }
    offer() {
      const params = {};
      if (this._options.serverNoContextTakeover) {
        params.server_no_context_takeover = true;
      }
      if (this._options.clientNoContextTakeover) {
        params.client_no_context_takeover = true;
      }
      if (this._options.serverMaxWindowBits) {
        params.server_max_window_bits = this._options.serverMaxWindowBits;
      }
      if (this._options.clientMaxWindowBits) {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (this._options.clientMaxWindowBits == null) {
        params.client_max_window_bits = true;
      }
      return params;
    }
    accept(paramsList) {
      paramsList = this.normalizeParams(paramsList);
      var params;
      if (this._isServer) {
        params = this.acceptAsServer(paramsList);
      } else {
        params = this.acceptAsClient(paramsList);
      }
      this.params = params;
      return params;
    }
    cleanup() {
      if (this._inflate) {
        if (this._inflate[kWriteInProgress]) {
          this._inflate[kPendingClose] = true;
        } else {
          this._inflate.close();
          this._inflate = null;
        }
      }
      if (this._deflate) {
        if (this._deflate[kWriteInProgress]) {
          this._deflate[kPendingClose] = true;
        } else {
          this._deflate.close();
          this._deflate = null;
        }
      }
    }
    acceptAsServer(paramsList) {
      const accepted = {};
      const result = paramsList.some((params) => {
        if ((this._options.serverNoContextTakeover === false && params.server_no_context_takeover) || (this._options.serverMaxWindowBits === false && params.server_max_window_bits) || (typeof this._options.serverMaxWindowBits === 'number' && typeof params.server_max_window_bits === 'number' && this._options.serverMaxWindowBits > params.server_max_window_bits) || (typeof this._options.clientMaxWindowBits === 'number' && !params.client_max_window_bits)) {
          return;
        }
        if (this._options.serverNoContextTakeover || params.server_no_context_takeover) {
          accepted.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover || (this._options.clientNoContextTakeover !== false && params.client_no_context_takeover)) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof this._options.serverMaxWindowBits === 'number') {
          accepted.server_max_window_bits = this._options.serverMaxWindowBits;
        } else if (typeof params.server_max_window_bits === 'number') {
          accepted.server_max_window_bits = params.server_max_window_bits;
        }
        if (typeof this._options.clientMaxWindowBits === 'number') {
          accepted.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits !== false && typeof params.client_max_window_bits === 'number') {
          accepted.client_max_window_bits = params.client_max_window_bits;
        }
        return true;
      });
      if (!result)
        throw new Error("Doesn't support the offered configuration");
      return accepted;
    }
    acceptAsClient(paramsList) {
      const params = paramsList[0];
      if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
        throw new Error('Invalid value for "client_no_context_takeover"');
      }
      if ((typeof this._options.clientMaxWindowBits === 'number' && (!params.client_max_window_bits || params.client_max_window_bits > this._options.clientMaxWindowBits)) || (this._options.clientMaxWindowBits === false && params.client_max_window_bits)) {
        throw new Error('Invalid value for "client_max_window_bits"');
      }
      return params;
    }
    normalizeParams(paramsList) {
      return paramsList.map((params) => {
        Object.keys(params).forEach((key) => {
          var value = params[key];
          if (value.length > 1) {
            throw new Error(`Multiple extension parameters for ${key}`);
          }
          value = value[0];
          switch (key) {
            case 'server_no_context_takeover':
            case 'client_no_context_takeover':
              if (value !== true) {
                throw new Error(`invalid extension parameter value for ${key} (${value})`);
              }
              params[key] = true;
              break;
            case 'server_max_window_bits':
            case 'client_max_window_bits':
              if (typeof value === 'string') {
                value = parseInt(value, 10);
                if (Number.isNaN(value) || value < zlib.Z_MIN_WINDOWBITS || value > zlib.Z_MAX_WINDOWBITS) {
                  throw new Error(`invalid extension parameter value for ${key} (${value})`);
                }
              }
              if (!this._isServer && value === true) {
                throw new Error(`Missing extension parameter value for ${key}`);
              }
              params[key] = value;
              break;
            default:
              throw new Error(`Not defined extension parameter (${key})`);
          }
        });
        return params;
      });
    }
    decompress(data, fin, callback) {
      zlibLimiter.push((done) => {
        this._decompress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    compress(data, fin, callback) {
      zlibLimiter.push((done) => {
        this._compress(data, fin, (err, result) => {
          done();
          callback(err, result);
        });
      });
    }
    _decompress(data, fin, callback) {
      const endpoint = this._isServer ? 'client' : 'server';
      if (!this._inflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._inflate = zlib.createInflateRaw({windowBits});
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        this._inflate[kOwner] = this;
        this._inflate.on('error', inflateOnError);
        this._inflate.on('data', inflateOnData);
      }
      this._inflate[kCallback] = callback;
      this._inflate[kWriteInProgress] = true;
      this._inflate.write(data);
      if (fin)
        this._inflate.write(TRAILER);
      this._inflate.flush(() => {
        const err = this._inflate[kError];
        if (err) {
          this._inflate.close();
          this._inflate = null;
          callback(err);
          return;
        }
        const data = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
        if ((fin && this.params[`${endpoint}_no_context_takeover`]) || this._inflate[kPendingClose]) {
          this._inflate.close();
          this._inflate = null;
        } else {
          this._inflate[kWriteInProgress] = false;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
        }
        callback(null, data);
      });
    }
    _compress(data, fin, callback) {
      if (!data || data.length === 0) {
        process.nextTick(callback, null, EMPTY_BLOCK);
        return;
      }
      const endpoint = this._isServer ? 'server' : 'client';
      if (!this._deflate) {
        const key = `${endpoint}_max_window_bits`;
        const windowBits = typeof this.params[key] !== 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
        this._deflate = zlib.createDeflateRaw({
          memLevel: this._options.memLevel,
          level: this._options.level,
          flush: zlib.Z_SYNC_FLUSH,
          windowBits
        });
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
        this._deflate.on('data', deflateOnData);
      }
      this._deflate[kWriteInProgress] = true;
      this._deflate.write(data);
      this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
        var data = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
        if (fin)
          data = data.slice(0, data.length - 4);
        if ((fin && this.params[`${endpoint}_no_context_takeover`]) || this._deflate[kPendingClose]) {
          this._deflate.close();
          this._deflate = null;
        } else {
          this._deflate[kWriteInProgress] = false;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
        }
        callback(null, data);
      });
    }
  }
  module.exports = PerMessageDeflate;
  function deflateOnData(chunk) {
    this[kBuffers].push(chunk);
    this[kTotalLength] += chunk.length;
  }
  function inflateOnData(chunk) {
    this[kTotalLength] += chunk.length;
    if (this[kOwner]._maxPayload < 1 || this[kTotalLength] <= this[kOwner]._maxPayload) {
      this[kBuffers].push(chunk);
      return;
    }
    this[kError] = new Error('max payload size exceeded');
    this[kError].closeCode = 1009;
    this.removeListener('data', inflateOnData);
    this.reset();
  }
  function inflateOnError(err) {
    this[kOwner]._inflate = null;
    this[kCallback](err);
  }
})(require('buffer').Buffer, require('process'));
