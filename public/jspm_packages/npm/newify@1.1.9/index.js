/* */ 
var getInstantiatorFunction = require('./getInstantiatorFunction');
module.exports = function(fn, args) {
  return getInstantiatorFunction(args.length)(fn, args);
};
