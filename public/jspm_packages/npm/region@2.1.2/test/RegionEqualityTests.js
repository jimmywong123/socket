/* */ 
describe('Region equal', function() {
  var Region = require('../index');
  it('size should return fine', function() {
    var r = Region({
      top: 10,
      left: 10,
      width: 10,
      height: 10
    });
    r.equalsSize({
      width: 10,
      height: 10
    }).should.equal(true);
  });
});