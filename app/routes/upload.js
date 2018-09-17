

var router = require('koa-router')()

var $ = require('../common/mount-controllers')(__dirname).upload_controller

var $middlewares  = require('../common/mount-middlewares')(__dirname)

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  POST   /upload    => upload.upload()
 *
 */

router.post('/' , $middlewares.better_body, $.upload)
//router.post('/' , $middlewares.auth.userRequired, $middlewares.better_body, $.upload)

module.exports = router
