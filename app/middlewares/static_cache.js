/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */


const path = require('path')
const staticCache = require('koa-static-cache')

module.exports = staticCache(path.join(__dirname, '../../public'), {
    maxAge: 365 * 24 * 60 * 60
})