
var router = require('koa-router')()

const logger = require('../common/logger')(__filename.replace(__dirname, ''))

var $middlewares  = require('../common/mount-middlewares')(__dirname)




router.get('/' , $middlewares.auth.userRequired, function *(next){
  logger.info(`${this.method} / , query: ${JSON.stringify(this.query)}`)
  yield this.render('index', {
    title: 'Hello World'
  })
})


module.exports = router
