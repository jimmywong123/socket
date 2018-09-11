
var router = require('koa-router')()

const logger = require('../common/logger')(__filename.replace(__dirname, ''))

var $middlewares = require('../common/mount-middlewares')(__dirname)
//var $ = require('../common/mount-controllers')(__dirname).socket_controller

router.get('/', $middlewares.check_api_token, function* (next) {
  yield this.render('socket/index', {
    title: 'Hello World'
  })
})

//router.post('/sendMsg',$.sendMsg)

module.exports = router
