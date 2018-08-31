/*!
 *
 * Copyright(c) 2015-2019 Thomas Lau <thomas_0836@qq.com>
 * MIT Licensed
 */

const logger = require('../common/logger')()

module.exports = (ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
  })
}