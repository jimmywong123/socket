/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */


const redisConfig = require('../../config/redis')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')

module.exports = session({
    store: redisStore(redisConfig)
})