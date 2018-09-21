/* */ 
describe('newify', function() {
  var newify = require('../index');
  function Student(firstName, lastName, birthYear) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthYear = birthYear;
  }
  it('should work as expected', function() {
    var s = newify(Student, ['john', 'scot', 1980]);
    ;
    (s instanceof Student).should.equal(true);
    s.firstName.should.equal('john');
    s.lastName.should.equal('scot');
    s.birthYear.should.equal(1980);
  });
});