var router = require('koa-router')()
var $middlewares  = require('../../common/mount-middlewares')(__dirname)

var $ = require('../../common/mount-controllers')(__dirname).socket_controller;

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  post   /api/auth            => index.auth()
 *  post   /api/auth/check      => index.check()
 */

router.post('/', $.api.auth)

module.exports = router
