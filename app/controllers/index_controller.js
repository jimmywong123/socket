"use strict"

const jwt = require('jsonwebtoken')
const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const apiFormat = require('../common/res_api_format')
const tools = require('../common/tools')

const auth = require('../middlewares/auth')

const $models = require('../common/mount-models')(__dirname)

const User = $models.user

const usersServices = require('../services/users_services')

/**
 * define some page when login just jump to the home page
 * @type {Array}
 */
const notJump = [
    '/login',         //regist page
]


exports.login = function *(next){
    logger.info(`${this.method} /api/auth => auth, query: ${JSON.stringify(this.query)}, params: ${JSON.stringify(this.params)}, body: ${JSON.stringify(this.request.body)}`)
    
    const username = validator.trim(this.request.body.username || '').toLowerCase()
    const password = validator.trim(this.request.body.password || '')

    var editError
    if (!username) {
        editError = 'Please enter the username'
    } else if (!password) {
        editError = 'Please enter the password'
    }

    if (editError) {
        this.redirect(`/login?editError=${editError}&username=${username}`)
    } else {
        var {data, user} = yield _checkUserNameAndPassword(username, password)

        if(data.success){

            yield auth.gen_session(user,this)

            var session = yield this.sessionStore.get(this.sessionId)

            var refer = session._loginReferer || '/'
            for (var i = 0, len = notJump.length ; i != len ; ++ i) {
                if (refer.indexOf(notJump[i]) >= 0) {
                    refer = '/'
                    break
                }
            }
            this.redirect(refer)
        } else {
            this.redirect(`/login?editError=${data.message}&username=${username}`)
        }
    }
}


// -- custom api
exports.api = {
  index: function *(next){
      logger.info(`${this.method} /api => list, query: ${JSON.stringify(this.query)}`)

      this.body = apiFormat.api({
          authorizations_url : {
              title: 'get token',
              href: `post: ${Config.host}/api/auth`,
              params: [
                  {name: 'username' , type: 'string'},
                  {name: 'password' , type: 'string'},
              ],
              res: {}
          }
      })
  },
  check: function *(next){
      logger.info(`${this.method} /api/auth => auth, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)} , body: ${JSON.stringify(this.request.body)}`)

      const username = validator.trim(this.request.body.username || '').toLowerCase()
      const password = validator.trim(this.request.body.password || '')

      var editError
      if (!username) {
          editError = 'Please enter the username'
      } else if (!password) {
          editError = 'Please enter the password'
      }

      if (editError) {
          this.body = apiFormat.api_error({
              success: false,
              message: editError
          })
      } else {
          var {data, user} = yield _checkUserNameAndPassword(username, password)
          if(data.success){
              this.body = apiFormat.api(data)
          } else {
              this.body = apiFormat.api_error(data)
          }
      }
  },

  auth: function *(next){
      logger.info(`${this.method} /api/auth => auth, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)} , body: ${JSON.stringify(this.request.body)}`)

      const username = validator.trim(this.request.body.username || '')
      const password = validator.trim(this.request.body.password || '')

      var editError,
          data = {
              success: false,
              message: 'Enjoy your data!'
          }
      if (!username) {
          editError = 'Please enter the username'
      } else if (!password) {
          editError = 'Please enter the password'
      }

      if (!editError) {
          if (!(username === Config.appId && password === Config.appSecret)) {
              editError = 'the username or password error'
          }
      }

      if (editError) {
          data.message = editError
          this.body = apiFormat.api_error(data)
      } else {
          var new_token = jwt.sign({username: username, password: password}, Config.session_secret, {
              expiresIn : 60 * 10 // 设置过期时间 10分钟
          })
          data.success = true
          data.token = new_token
          yield auth.gen_session(data,this)
          this.body = apiFormat.api(data)
      }
  }
}

var _checkUserNameAndPassword = function *(username,password){
    var user = yield User.findOne({
        where: {username: username}
    })
    var data = {
        success: false,
        message: 'Enjoy your token!'
    }
    if (user) {
        var bool = yield tools.bcompare(`${username}##${Config.session_secret}##${password}`,user.password)
        if (bool){
            if (user.is_lock) {
                data.message = 'This account has been locked, please contact our customer service if you have any questions'
            } else {

                user.lastAt = new Date()
                yield user.save()

                data.message = 'Enjoy your Data!'
                data.success = true
                data.roleType = user.roleType

                logger.debug(`_checkUserNameAndPassword user.roleType : ${user.roleType}, user.roleType === Enumeration.roleType[2].value : ${user.roleType === Enumeration.roleType[2].value}`)

                // if (user.roleType === Enumeration.roleType[2].value) {
                //     var clientId = yield usersServices.getUserClientId(user.id)
                //     if (clientId) {
                //         data.clientId = clientId
                //     }
                // }
            }
        } else {
            data.message = 'Authentication failed, password mistake'
        }
    } else {
        data.message = `Authentication failed, can't find the username`
    }

    return {data: data, user: user}
}