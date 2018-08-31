

var router = require('koa-router')()

const logger = require('../common/logger')(__filename.replace(__dirname, ''))

// core controller
var $ = require('../common/mount-controllers')(__dirname).index_controller


/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /login
 *  POST   /login    => index.login()
 *
 */

router.get('/', function *(next){
  logger.info(`${this.method} /login , query: ${JSON.stringify(this.query)}`)

  var session = this.sessionStore.get(this.sessionId)
  session._loginReferer = this.headers.referer

  // this.body = {};

  // let users_controller = require('../controllers/users_controller');
  // users_controller.create().next();
  //const tools = require('../common/tools');
  //logger.info(yield tools.bhash(`123##hired_base_secret##123`));

  yield this.render('login/index', {
    username : this.query.username,
    editError : this.query.editError,
    title: 'Sign in Hried china'
  })
})

router.post('/', $.login);




module.exports = router
