/*!
 * Moajs Middle
 * Copyright(c) 2015-2019 Alfred Sang <shiren1118@126.com>
 * MIT Licensed
 */


const jwt = require('jsonwebtoken')//用来创建和确认用户信息摘要
const apiFormat = require('../common/res_api_format')
const logger = require('../common/logger')()

// 检查用户会话
module.exports = function *(next) {

  logger.debug('检查post的信息或者url查询参数或者头信息')
  
  //检查post的信息或者url查询参数或者头信息
  var token = this.request.body.token || this.query.token || this.headers['x-access-token']

  logger.debug(`check_api_token token = ${token}`)
  // 解析 token
  if (token) {
    // 确认token
    try {
      var decoded = 
      jwt.verify(token, Config.session_secret)
      this.api_user = decoded
      logger.debug(this.api_user)
    } catch(err) {
      logger.debug(`check_api_token err = ${err.message}`)
      return this.body = apiFormat.api_error({
        success: false,
        message: 'token信息错误！',
        isTokenErr : true
      })
    }
  } else {
    // 如果没有token，则返回错误
    this.status = 403
    return this.body = apiFormat.api_error({
        success: false,
        message: '没有提供token！',
    })
  }

  yield next
}