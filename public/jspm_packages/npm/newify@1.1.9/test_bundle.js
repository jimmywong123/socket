/* */ 
(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a)
          return a(o, !0);
        if (i)
          return i(o, !0);
        throw new Error("Cannot find module '" + o + "'");
      }
      var f = n[o] = {exports: {}};
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n ? n : e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++)
    s(r[o]);
  return s;
})({
  1: [function(require, module, exports) {
    module.exports = function() {
      'use strict';
      var fns = {};
      return function(len) {
        if (!fns[len]) {
          var args = [];
          var i = 0;
          for (; i < len; i++) {
            args.push('a[' + i + ']');
          }
          fns[len] = new Function('c', 'a', 'return new c(' + args.join(',') + ')');
        }
        return fns[len];
      };
    }();
  }, {}],
  2: [function(require, module, exports) {
    var getInstantiatorFunction = require('./getInstantiatorFunction');
    module.exports = function(fn, args) {
      return getInstantiatorFunction(args.length)(fn, args);
    };
  }, {"./getInstantiatorFunction": 1}],
  3: [function(require, module, exports) {
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
  }, {"../index": 2}]
}, {}, [3]);