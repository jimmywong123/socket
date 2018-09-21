/* */ 
describe('Region intersection', function() {
  var Region = require('../index');
  it('should containPoint', function() {
    var inner = Region({
      left: 97,
      right: 147,
      top: 51,
      bottom: 251
    });
    var outer = Region({
      left: 11,
      right: 447,
      top: 51,
      bottom: 937
    });
    outer.getIntersection(inner).getArea().should.equal(inner.getArea());
  });
});