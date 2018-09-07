/**
 * Created by user on 22/6/15.
 */
"use strict"
var logger = require('../common/logger')()

const $models = require('mount-models')(__dirname)

const User = $models.user

function *gen_session(user, t) {
    var auth_token = user.id + '$$$$' //以后可能会存储更多信息，用 $$$$ 来分嗝

    var session = t.session

    session[Config.auth_cookie_name] = auth_token
    session.cookie.domain = 'hiredchina.cn'
    session.user = user

    yield t.sessionStore.set(t.sessionId,session)
}

exports.gen_session = gen_session

/**
 * 需要登录
 */
exports.userRequired = function *(next) {

    var session = this.session

    if (!session || !session.user) {
        this.status = 403
        return yield this.render('error', {
            message: 'forbidden',
            error: {status: 403, stack: 'You need Login before' }
        })
    }
    yield next
}

exports.blockUser = function *(next) {
    if (this.path === '/signout') {
        return yield next
    }
    var session = this.session

    if (session && session.user && session.user.is_block && this.method !== 'GET') {
        this.status = 403
        return yield this.render('error', {
            message: 'forbidden',
            error: {status: 403, stack: 'You have be screened by administrative person. Have any questions, please contact the customer' }
        })
    }
    yield next
}


/**
 * 需要客户权限
 */
exports.clientRequired = function *(next) {

    var session = this.session

    if (!session || !session.user) {
        logger.info('!session.user = ' + (!session.user))
        return this.redirect('/login')
    }
    var roleType = session.user.roleType
    if (!(roleType === Enumeration.roleType[2].value
        || roleType === Enumeration.roleType[0].value)) {
        this.status = 204
        return yield this.render('error', {
            message: 'proxy authentication required',
            error: {status: 204, stack: 'You need client authentication required' }
        })
    }
    yield next
}

/**
 * 需要管理员权限
 */
exports.managerRequired = function *(next) {

    var session = this.session

    if (!session || !session.user) {
        logger.info('!session.user = ' + (!session.user))
        return this.redirect('/login')
    }
    var roleType = session.user.roleType
    if (!(roleType === Enumeration.roleType[1].value
        || roleType === Enumeration.roleType[0].value)) {
        this.status = 204
        return yield this.render('error', {
            message: 'proxy authentication required',
            error: {status: 204, stack: 'You need manager authentication required' }
        })
    }
    yield next
}

/**
 * 需要人才权限
 */
exports.personRequired = function *(next) {

    var session = this.session

    if (!session || !session.user) {
        logger.info('!this.session.user = ' + (!session.user))
        return this.redirect('/login')
    }
    var roleType = session.user.roleType
    if (!(roleType === Enumeration.roleType[3].value
     || roleType === Enumeration.roleType[0].value)) {
        this.status = 204
        return yield this.render('error', {
            message: 'proxy authentication required',
            error: {status: 204, stack: 'You need person authentication required' }
        })
    }
    yield next
}

/**
 * 需要管理员权限
 */
exports.adminRequired = function *(next) {

    var session = this.session

    if (!session || !session.user) {
        logger.info('!this.session.user = ' + (!session.user))
        return this.redirect('/login')
    }
    var roleType = session.user.roleType
    if (!(roleType === Enumeration.roleType[0].value)) {
        this.status = 204
        return yield this.render('error', {
            message: 'proxy authentication required',
            error: {status: 204, stack: 'You need administrator authentication required' }
        })
    }
    yield next
}

// 验证用户是否登录
exports.authUser = function *(next) {
    var session = this.session
    // Ensure current_user always has defined.
    this.state.current_user = null

    if (!session) {
        return yield next
    }

    var user
    if (session.user) {
        user = session.user
    } else {
        var auth_token = session[Config.auth_cookie_name]
        if (!auth_token) {
            return yield next
        }

        var auth = auth_token.split('$$$$')
        var user_id = auth[0]
        user = yield User.findOne({id: user_id})
    }

    if (!user) {
        return yield next
    }
    user = this.state.current_user = session.user = User.build(user)

    yield next


    //如果req.session 是undefined 请检查 redies 是否正常

}
