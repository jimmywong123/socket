/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */


const path = require('path')
const log4js = require('koa-log4')

module.exports = log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' })