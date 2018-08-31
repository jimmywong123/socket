/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */


const path = require('path')
const views = require('koa-views')

module.exports = views(path.join(__dirname, '../../app/views'),  {
  extension: 'jade'
})