"use strict"

var router = require('koa-router')()
const co = require('co')

var $middlewares  = require('../common/mount-middlewares')(__dirname)

// core controller
var $ = require('../common/mount-controllers')(__dirname).users_controller

/**
 * Auto generate RESTful url routes.
 *
 * URL routes:
 *
 *  GET    /users[/]        => user.list()
 *  GET    /users/new       => user.new()
 *  GET    /users/:id       => user.show()
 *  GET    /users/:id/edit  => user.edit()
 *  POST   /users[/]        => user.create()
 *  PATCH  /users/:id       => user.update()
 *  DELETE /users/:id       => user.destroy()
 *
 */

router.get('/new', $middlewares.auth.adminRequired , $.new)

router.get('/:id/edit', $middlewares.auth.adminRequired , $.edit)

router.get('/', $middlewares.auth.adminRequired , $.list)

router.post('/', $middlewares.auth.adminRequired , $.create)

router.get('/:id', $middlewares.auth.adminRequired , $.show)

router.patch('/:id', $middlewares.auth.adminRequired , $.update)

router.delete('/:id', $middlewares.auth.adminRequired , $.destroy)

// -- custom routes




module.exports = router