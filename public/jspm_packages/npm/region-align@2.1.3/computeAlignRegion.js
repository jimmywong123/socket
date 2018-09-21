/* */ 
'use strict';
var ALIGN_TO_NORMALIZED = require('./alignToNormalized');
var Region = require('region');
function COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config) {
  sourceRegion = Region.from(sourceRegion);
  var sourceClone = sourceRegion.clone();
  var position = ALIGN_TO_NORMALIZED(sourceClone, targetRegion, positions, config);
  return {
    position: position,
    region: sourceClone,
    widthChanged: sourceClone.getWidth() != sourceRegion.getWidth(),
    heightChanged: sourceClone.getHeight() != sourceRegion.getHeight(),
    positionChanged: sourceClone.equalsPosition(sourceRegion)
  };
}
module.exports = COMPUTE_ALIGN_REGION;
