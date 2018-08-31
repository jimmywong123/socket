"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const tools = require('../common/tools')

const $models = require('../common/mount-models')(__dirname)

const User = $models.user


exports.list = function *(next){
    logger.info(`${this.method} /users => list, query: ${JSON.stringify(this.query)}`)

    var page = parseInt(this.query.page, 10) || 1
    page = page > 0 ? page : 1
    var sort = this.query.sortby || 'createdAt DESC'
    const limit = Config.list_count

    //是否用了关键词搜索
    const kw = this.query.kw
    var where = {}
    if (kw) {
        where = {
            username : {$like : `%${kw}%`}
        }
    }

    var result = yield User.findAndCountAll({
        where: where,
        offset: (page - 1) * limit,
        limit: limit,
        order: sort
    })

    const all_count = result.count
    const pages = Math.ceil(all_count / limit)


    yield this.render('users/index', {
        current_page: page,
        pages: pages,
        all_count: all_count,
        kw: kw,
        sortby: sort,
        list: result.rows,
    })
}


exports.new = function *(next){
    logger.info(`${this.method} /users/new => new, query: ${JSON.stringify(this.query)}`)

    yield this.render('users/new', {
        editError : this.query.editError,
        user : {
          "_action" : "new"
        }
    })
}


exports.show = function *(next){
    logger.info(`${this.method} /users/:id => show, query: ${JSON.stringify(this.query)}
        , params: ${JSON.stringify(this.params)}`)

    var id = this.params.id

    var user = yield User.findById(id)

    if (!user) {
        yield this.render('error', {
            message: 'no this user',
            error: {status: 204, stack: 'no content' }
        })
    }else {
        yield this.render('users/show', {
            user : user
        })
    }
}

exports.edit = function *(next){
    logger.info(`${this.method} /users/:id/edit => edit, query: ${JSON.stringify(this.query)}
        , params: ${JSON.stringify(this.params)}`)

    var id = this.params.id

    var user = yield User.findById(id)
    if (!user) {
        yield this.render('error', {
            message: 'no this user',
            error: {status: 204, stack: 'no content' }
        })
    }else {
        user._action = 'edit'

        yield this.render('users/edit', {
            editError : this.query.editError,
            user : user
        })
    }
}

exports.create = function *(next){
    logger.info(`${this.method} /users => create, query: ${JSON.stringify(this.query)}
        , params: ${JSON.stringify(this.params)}
        , body: ${JSON.stringify(this.request.body)}`)

    var editError = _getEditError(this.request.body)

    if (editError) {
        this.redirect(`/users/new?editError=${editError}`)
    } else {
        var willSaveUser = yield _hashUserPassword(this.request.body)

        try {
            var user = yield User.create(willSaveUser)
            this.redirect(`/users/${user.id}`)
        } catch(err) {
            editError = err.message
            this.redirect(`/users/new?editError=${editError}`)
        }
    }
}

exports.update = function *(next){
    logger.info(`${this.method} /users/:id => update, query: ${JSON.stringify(this.query)}
        , params: ${JSON.stringify(this.params)}
        , body: ${JSON.stringify(this.request.body)}`)

    var id = this.params.id

    var editError = _getEditError(this.request.body)

    if (editError) {
        yield this.body = ({
            data:{},
            status:{
                code : 1,
                msg  : editError
            }
        })
    } else {
        var willSaveUser = yield _hashUserPassword(this.request.body)
        try {
            yield User.update(
                willSaveUser, /* set attributes' value */
                { where: { id: id }} /* where criteria */
            )
            yield this.body = ({
                data:{
                    redirect : '/users/' + id
                },
                status:{
                    code : 0,
                    msg  : 'update success!'
                }
            })
        } catch(err) {
            editError = err.message
            this.body = ({
                data:{},
                status:{
                    code : 1,
                    msg  : editError
                }
            })
        }

    }
}

exports.destroy = function *(next){
    logger.info(`${this.method} /users/:id => destroy, query: ${JSON.stringify(this.query)}
        , params: ${JSON.stringify(this.params)}
        , body: ${JSON.stringify(this.request.body)}`)

    var id = this.params.id

    yield User.destroy({
        where: {
            id: id
        },
    })

    yield this.body= ({
        data:{},
        status:{
            code : 0,
            msg  : 'delete success!'
        }
    })
}


var _hashUserPassword = function *(user){

    const password = validator.trim(user.password)

    const hashPassword = yield tools.bhash(`${user.username}##${Config.session_secret}##${user.password}`)

    user.password = hashPassword
    return user
}

var _getEditError = (body) => {
    const username = validator.trim(body.username).toLowerCase()
    const password = validator.trim(body.password)
    const roleType = validator.trim(body.roleType)

    var editError

    if ([username, password, roleType].some(function (item) { return item === ''})) {
        editError = 'There will not fill in the information'
    } else if (username.length < 5) {
        editError = 'The Username should have at least five characters.'
    } else if (!tools.validateId(username)) {
        editError = 'Username can exist only letters, Numbers, _ and -'
    } else if (password.length < 6) {
        editError = 'The Password should have at least 6 characters.'
    }
    return editError
}

