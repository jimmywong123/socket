/* */ 
(function(Buffer) {
  'use strict';
  class Event {
    constructor(type, target) {
      this.target = target;
      this.type = type;
    }
  }
  class MessageEvent extends Event {
    constructor(data, target) {
      super('message', target);
      this.data = data;
    }
  }
  class CloseEvent extends Event {
    constructor(code, reason, target) {
      super('close', target);
      this.wasClean = target._closeFrameReceived && target._closeFrameSent;
      this.reason = reason;
      this.code = code;
    }
  }
  class OpenEvent extends Event {
    constructor(target) {
      super('open', target);
    }
  }
  const EventTarget = {
    addEventListener(method, listener) {
      if (typeof listener !== 'function')
        return;
      function onMessage(data) {
        listener.call(this, new MessageEvent(data, this));
      }
      function onClose(code, message) {
        listener.call(this, new CloseEvent(code, message, this));
      }
      function onError(event) {
        event.type = 'error';
        event.target = this;
        listener.call(this, event);
      }
      function onOpen() {
        listener.call(this, new OpenEvent(this));
      }
      if (method === 'message') {
        onMessage._listener = listener;
        this.on(method, onMessage);
      } else if (method === 'close') {
        onClose._listener = listener;
        this.on(method, onClose);
      } else if (method === 'error') {
        onError._listener = listener;
        this.on(method, onError);
      } else if (method === 'open') {
        onOpen._listener = listener;
        this.on(method, onOpen);
      } else {
        this.on(method, listener);
      }
    },
    removeEventListener(method, listener) {
      const listeners = this.listeners(method);
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] === listener || listeners[i]._listener === listener) {
          this.removeListener(method, listeners[i]);
        }
      }
    }
  };
  module.exports = EventTarget;
})(require('buffer').Buffer);
