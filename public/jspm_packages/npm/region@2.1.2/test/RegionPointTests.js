/* */ 
describe('Region point functions', function() {
  var Region = require('../index');
  it('should containPoint', function() {
    var r = Region({
      top: 10,
      left: 10,
      width: 10,
      height: 10
    });
    r.containsPoint(15, 10).should.equal(true);
    r.containsPoint({
      x: 10,
      y: 10
    }).should.equal(true);
    r.containsPoint(25, 10).should.equal(false);
  });
});
