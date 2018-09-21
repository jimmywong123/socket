/* */ 
'use strict';
var Region = require('region');
require('./Region.static');
require('./Region.proto');
var COMPUTE_ALIGN_REGION = require('./computeAlignRegion');
Region.alignRegions = function(sourceRegion, targetRegion, positions, config) {
  var result = COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config);
  var alignedRegion = result.region;
  if (!alignedRegion.equals(sourceRegion)) {
    sourceRegion.setRegion(alignedRegion);
  }
  return result.position;
};
Region.prototype.alignTo = function(target, positions, config) {
  config = config || {};
  var sourceRegion = this;
  var targetRegion = Region.from(target);
  var result = COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config);
  var resultRegion = result.region;
  if (!resultRegion.equalsSize(sourceRegion)) {
    this.setSize(resultRegion.getSize());
  }
  if (!resultRegion.equalsPosition(sourceRegion)) {
    this.setPosition(resultRegion.getPosition(), {absolute: !!config.absolute});
  }
  return result.position;
};
module.exports = Region;
