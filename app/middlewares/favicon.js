/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */


const path = require('path')
const favicon = require('koa-favicon')

module.exports = favicon(path.join(__dirname, '../../public/favicon.png'))