/* */ 
'use strict';
var Region = require('../index');
function ALIGN_TO_NORMALIZED(sourceRegion, targetRegion, positions, config) {
  targetRegion = Region.from(targetRegion);
  config = config || {};
  var constrainTo = config.constrain,
      syncOption = config.sync,
      offsets = config.offset || [],
      syncWidth = false,
      syncHeight = false,
      sourceClone = sourceRegion.clone();
  if (!Array.isArray(positions)) {
    positions = positions ? [positions] : [];
  }
  if (!Array.isArray(offsets)) {
    offsets = offsets ? [offsets] : [];
  }
  if (constrainTo) {
    constrainTo = constrainTo === true ? Region.getDocRegion() : constrainTo.getRegion();
  }
  if (syncOption) {
    if (syncOption.size) {
      syncWidth = true;
      syncHeight = true;
    } else {
      syncWidth = syncOption === true ? true : syncOption.width || false;
      syncHeight = syncOption === true ? true : syncOption.height || false;
    }
  }
  if (syncWidth) {
    sourceClone.setWidth(targetRegion.getWidth());
  }
  if (syncHeight) {
    sourceClone.setHeight(targetRegion.getHeight());
  }
  var offset,
      i = 0,
      len = positions.length,
      pos,
      intersection,
      itArea,
      maxArea = -1,
      maxAreaIndex = -1;
  for (; i < len; i++) {
    pos = positions[i];
    offset = offsets[i];
    sourceClone.alignToRegion(targetRegion, pos);
    if (offset) {
      if (!Array.isArray(offset)) {
        offset = offsets[i] = [offset.x || offset.left, offset.y || offset.top];
      }
      sourceClone.shift({
        left: offset[0],
        top: offset[1]
      });
    }
    if (constrainTo) {
      intersection = sourceClone.getIntersection(constrainTo);
      if (intersection && intersection.equals(sourceClone)) {
        sourceRegion.set(sourceClone);
        return pos;
      } else {
        if (intersection && ((itArea = intersection.getArea()) > maxArea)) {
          maxArea = itArea;
          maxAreaIndex = i;
        }
      }
    } else {
      sourceRegion.set(sourceClone);
      return pos;
    }
  }
  if (~maxAreaIndex) {
    pos = positions[maxAreaIndex];
    offset = offsets[maxAreaIndex];
    sourceClone.alignToRegion(targetRegion, pos);
    if (offset) {
      sourceClone.shift({
        left: offset[0],
        top: offset[1]
      });
    }
    intersection = sourceClone.getIntersection(constrainTo);
    sourceClone.setRegion(intersection);
    sourceClone.alignToRegion(targetRegion, pos);
    if (offset) {
      sourceClone.shift({
        left: offset[0],
        top: offset[1]
      });
    }
    sourceRegion.set(sourceClone);
    return pos;
  }
}
module.exports = ALIGN_TO_NORMALIZED;
