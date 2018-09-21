/* */ 
'use strict';
var hasOwn = require('hasown');
var newify = require('newify');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var inherits = require('./inherits');
var VALIDATE = require('./validate');
var objectToString = Object.prototype.toString;
var isObject = function(value) {
  return objectToString.apply(value) === '[object Object]';
};
function copyList(source, target, list) {
  if (source) {
    list.forEach(function(key) {
      if (hasOwn(source, key)) {
        target[key] = source[key];
      }
    });
  }
  return target;
}
var POINT_POSITIONS = {
  cy: 'YCenter',
  cx: 'XCenter',
  t: 'Top',
  tc: 'TopCenter',
  tl: 'TopLeft',
  tr: 'TopRight',
  b: 'Bottom',
  bc: 'BottomCenter',
  bl: 'BottomLeft',
  br: 'BottomRight',
  l: 'Left',
  lc: 'LeftCenter',
  r: 'Right',
  rc: 'RightCenter',
  c: 'Center'
};
var REGION = function(top, right, bottom, left) {
  if (!(this instanceof REGION)) {
    return newify(REGION, arguments);
  }
  EventEmitter.call(this);
  if (isObject(top)) {
    copyList(top, this, ['top', 'right', 'bottom', 'left']);
    if (top.bottom == null && top.height != null) {
      this.bottom = this.top + top.height;
    }
    if (top.right == null && top.width != null) {
      this.right = this.left + top.width;
    }
    if (top.emitChangeEvents) {
      this.emitChangeEvents = top.emitChangeEvents;
    }
  } else {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  }
  this[0] = this.left;
  this[1] = this.top;
  VALIDATE(this);
};
inherits(REGION, EventEmitter);
assign(REGION.prototype, {
  emitChangeEvents: false,
  getRegion: function(clone) {
    return clone ? this.clone() : this;
  },
  setRegion: function(reg) {
    if (reg instanceof REGION) {
      this.set(reg.get());
    } else {
      this.set(reg);
    }
    return this;
  },
  validate: function() {
    return REGION.validate(this);
  },
  _before: function() {
    if (this.emitChangeEvents) {
      return copyList(this, {}, ['left', 'top', 'bottom', 'right']);
    }
  },
  _after: function(before) {
    if (this.emitChangeEvents) {
      if (this.top != before.top || this.left != before.left) {
        this.emitPositionChange();
      }
      if (this.right != before.right || this.bottom != before.bottom) {
        this.emitSizeChange();
      }
    }
  },
  notifyPositionChange: function() {
    this.emit('changeposition', this);
  },
  emitPositionChange: function() {
    this.notifyPositionChange();
  },
  notifySizeChange: function() {
    this.emit('changesize', this);
  },
  emitSizeChange: function() {
    this.notifySizeChange();
  },
  add: function(directions) {
    var before = this._before();
    var direction;
    for (direction in directions)
      if (hasOwn(directions, direction)) {
        this[direction] += directions[direction];
      }
    this[0] = this.left;
    this[1] = this.top;
    this._after(before);
    return this;
  },
  substract: function(directions) {
    var before = this._before();
    var direction;
    for (direction in directions)
      if (hasOwn(directions, direction)) {
        this[direction] -= directions[direction];
      }
    this[0] = this.left;
    this[1] = this.top;
    this._after(before);
    return this;
  },
  getSize: function() {
    return {
      width: this.width,
      height: this.height
    };
  },
  setPosition: function(position) {
    var width = this.width;
    var height = this.height;
    if (position.left != undefined) {
      position.right = position.left + width;
    }
    if (position.top != undefined) {
      position.bottom = position.top + height;
    }
    return this.set(position);
  },
  setSize: function(size) {
    if (size.height != undefined && size.width != undefined) {
      return this.set({
        right: this.left + size.width,
        bottom: this.top + size.height
      });
    }
    if (size.width != undefined) {
      this.setWidth(size.width);
    }
    if (size.height != undefined) {
      this.setHeight(size.height);
    }
    return this;
  },
  setWidth: function(width) {
    return this.set({right: this.left + width});
  },
  setHeight: function(height) {
    return this.set({bottom: this.top + height});
  },
  set: function(directions) {
    var before = this._before();
    copyList(directions, this, ['left', 'top', 'bottom', 'right']);
    if (directions.bottom == null && directions.height != null) {
      this.bottom = this.top + directions.height;
    }
    if (directions.right == null && directions.width != null) {
      this.right = this.left + directions.width;
    }
    this[0] = this.left;
    this[1] = this.top;
    this._after(before);
    return this;
  },
  get: function(dir) {
    return dir ? this[dir] : copyList(this, {}, ['left', 'right', 'top', 'bottom']);
  },
  shift: function(directions) {
    var before = this._before();
    if (directions.top) {
      this.top += directions.top;
      this.bottom += directions.top;
    }
    if (directions.left) {
      this.left += directions.left;
      this.right += directions.left;
    }
    this[0] = this.left;
    this[1] = this.top;
    this._after(before);
    return this;
  },
  unshift: function(directions) {
    if (directions.top) {
      directions.top *= -1;
    }
    if (directions.left) {
      directions.left *= -1;
    }
    return this.shift(directions);
  },
  equals: function(region) {
    return this.equalsPosition(region) && this.equalsSize(region);
  },
  equalsSize: function(size) {
    var isInstance = size instanceof REGION;
    var s = {
      width: size.width == null && isInstance ? size.getWidth() : size.width,
      height: size.height == null && isInstance ? size.getHeight() : size.height
    };
    return this.getWidth() == s.width && this.getHeight() == s.height;
  },
  equalsPosition: function(region) {
    return this.top == region.top && this.left == region.left;
  },
  addLeft: function(left) {
    var before = this._before();
    this.left = this[0] = this.left + left;
    this._after(before);
    return this;
  },
  addTop: function(top) {
    var before = this._before();
    this.top = this[1] = this.top + top;
    this._after(before);
    return this;
  },
  addBottom: function(bottom) {
    var before = this._before();
    this.bottom += bottom;
    this._after(before);
    return this;
  },
  addRight: function(right) {
    var before = this._before();
    this.right += right;
    this._after(before);
    return this;
  },
  minTop: function() {
    return this.expand({top: 1});
  },
  maxBottom: function() {
    return this.expand({bottom: 1});
  },
  minLeft: function() {
    return this.expand({left: 1});
  },
  maxRight: function() {
    return this.expand({right: 1});
  },
  expand: function(directions, region) {
    var docRegion = region || REGION.getDocRegion();
    var list = [];
    var direction;
    var before = this._before();
    for (direction in directions)
      if (hasOwn(directions, direction)) {
        list.push(direction);
      }
    copyList(docRegion, this, list);
    this[0] = this.left;
    this[1] = this.top;
    this._after(before);
    return this;
  },
  clone: function() {
    return new REGION({
      top: this.top,
      left: this.left,
      right: this.right,
      bottom: this.bottom
    });
  },
  containsPoint: function(x, y) {
    if (arguments.length == 1) {
      y = x.y;
      x = x.x;
    }
    return this.left <= x && x <= this.right && this.top <= y && y <= this.bottom;
  },
  containsRegion: function(region) {
    return this.containsPoint(region.left, region.top) && this.containsPoint(region.right, region.bottom);
  },
  diffHeight: function(region) {
    return this.diff(region, {
      top: true,
      bottom: true
    });
  },
  diffWidth: function(region) {
    return this.diff(region, {
      left: true,
      right: true
    });
  },
  diff: function(region, directions) {
    var result = {};
    var dirName;
    for (dirName in directions)
      if (hasOwn(directions, dirName)) {
        result[dirName] = this[dirName] - region[dirName];
      }
    return result;
  },
  getPosition: function() {
    return {
      left: this.left,
      top: this.top
    };
  },
  getPoint: function(position, asLeftTop) {
    if (!POINT_POSITIONS[position]) {
      console.warn('The position ', position, ' could not be found! Available options are tl, bl, tr, br, l, r, t, b.');
    }
    var method = 'getPoint' + POINT_POSITIONS[position],
        result = this[method]();
    if (asLeftTop) {
      return {
        left: result.x,
        top: result.y
      };
    }
    return result;
  },
  getPointYCenter: function() {
    return {
      x: null,
      y: this.top + this.getHeight() / 2
    };
  },
  getPointXCenter: function() {
    return {
      x: this.left + this.getWidth() / 2,
      y: null
    };
  },
  getPointTop: function() {
    return {
      x: null,
      y: this.top
    };
  },
  getPointTopCenter: function() {
    return {
      x: this.left + this.getWidth() / 2,
      y: this.top
    };
  },
  getPointTopLeft: function() {
    return {
      x: this.left,
      y: this.top
    };
  },
  getPointTopRight: function() {
    return {
      x: this.right,
      y: this.top
    };
  },
  getPointBottom: function() {
    return {
      x: null,
      y: this.bottom
    };
  },
  getPointBottomCenter: function() {
    return {
      x: this.left + this.getWidth() / 2,
      y: this.bottom
    };
  },
  getPointBottomLeft: function() {
    return {
      x: this.left,
      y: this.bottom
    };
  },
  getPointBottomRight: function() {
    return {
      x: this.right,
      y: this.bottom
    };
  },
  getPointLeft: function() {
    return {
      x: this.left,
      y: null
    };
  },
  getPointLeftCenter: function() {
    return {
      x: this.left,
      y: this.top + this.getHeight() / 2
    };
  },
  getPointRight: function() {
    return {
      x: this.right,
      y: null
    };
  },
  getPointRightCenter: function() {
    return {
      x: this.right,
      y: this.top + this.getHeight() / 2
    };
  },
  getPointCenter: function() {
    return {
      x: this.left + this.getWidth() / 2,
      y: this.top + this.getHeight() / 2
    };
  },
  getHeight: function() {
    return this.bottom - this.top;
  },
  getWidth: function() {
    return this.right - this.left;
  },
  getTop: function() {
    return this.top;
  },
  getLeft: function() {
    return this.left;
  },
  getBottom: function() {
    return this.bottom;
  },
  getRight: function() {
    return this.right;
  },
  getArea: function() {
    return this.getWidth() * this.getHeight();
  },
  constrainTo: function(contrain) {
    var intersect = this.getIntersection(contrain);
    var shift;
    if (!intersect || !intersect.equals(this)) {
      var contrainWidth = contrain.getWidth(),
          contrainHeight = contrain.getHeight();
      if (this.getWidth() > contrainWidth) {
        this.left = contrain.left;
        this.setWidth(contrainWidth);
      }
      if (this.getHeight() > contrainHeight) {
        this.top = contrain.top;
        this.setHeight(contrainHeight);
      }
      shift = {};
      if (this.right > contrain.right) {
        shift.left = contrain.right - this.right;
      }
      if (this.bottom > contrain.bottom) {
        shift.top = contrain.bottom - this.bottom;
      }
      if (this.left < contrain.left) {
        shift.left = contrain.left - this.left;
      }
      if (this.top < contrain.top) {
        shift.top = contrain.top - this.top;
      }
      this.shift(shift);
      return true;
    }
    return false;
  },
  __IS_REGION: true
});
Object.defineProperties(REGION.prototype, {
  width: {
    get: function() {
      return this.getWidth();
    },
    set: function(width) {
      return this.setWidth(width);
    }
  },
  height: {
    get: function() {
      return this.getHeight();
    },
    set: function(height) {
      return this.setHeight(height);
    }
  }
});
require('./statics')(REGION);
module.exports = REGION;
