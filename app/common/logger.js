

var log4js = require('koa-log4')

module.exports = function(name){
    name = name || 'app'
    return log4js.getLogger(name)
}

