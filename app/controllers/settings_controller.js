"use strict"

const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const tools = require('../common/tools')
const apiFormat = require('../common/res_api_format')

const $models = require('../common/mount-models')(__dirname)

const typeObj = {
    area : $models.area,
    nationality : $models.nationality,
}

exports.json = function *(next) {
    logger.info(`${this.method} /settings/:type/json => json, query: ${JSON.stringify(this.query)}, params: ${JSON.stringify(this.params)}`)

    var type = this.params.type
    var Models = typeObj[type]
    var obj = {}

    if ( type === 'all'){
        var keys = Object.keys(typeObj)
        for ( var index in keys) {
            var key = keys[index]
            var thisModes = typeObj[key]
            obj[key] = yield thisModes.findAll({attributes : ['id','title'],order: `${key}.index,${key}.title`})
        }
    } else if( !type || !Models) {
        return this.body = apiFormat.api_error({
            success: false,
            message: 'must choose one type',
        })
    } else {
        obj[type] = yield Models.findAll({attributes : ['id','title']})
    }

    this.body = apiFormat.api(obj)
}


exports.base = function *(next) {
    logger.info(`${this.method} /settings => base, query: ${JSON.stringify(this.query)}`)

    yield this.render('settings/base', {
        title: 'Setting',
        typelist: Object.keys(typeObj),
    })
}


exports.list = function *(next){
    logger.info(`${this.method} /settings/:type => list, query: ${JSON.stringify(this.query)}, params: ${JSON.stringify(this.params)}`)

    var type = this.params.type
    var Models = typeObj[type]
    if( !type || !Models) {
        return yield this.render('error', {
            message: 'must choose one type',
            error: {status: 204, stack: 'no content' }
        })
    }

    var page = parseInt(this.query.page, 10) || 1
    page = page > 0 ? page : 1
    var sort = this.query.sortby || 'title'
    const limit = Config.list_count

    //是否用了关键词搜索
    const kw = this.query.kw
    var where = {}
    if (kw) {
        where = {
            title : {$like : `%${kw}%`}
        }
    }

    var result = yield Models.findAndCountAll({
        where: where,
        offset: (page - 1) * limit,
        limit: limit,
        order: sort
    })

    const all_count = result.count
    const pages = Math.ceil(all_count / limit)


    yield this.render('settings/index', {
        title: type,
        type: type,
        current_page: page,
        pages: pages,
        all_count: all_count,
        kw: kw,
        sortby: sort,
        list: result.rows,
    })
}


exports.new = function *(next){
    logger.info(`${this.method} /settings/new/:type => new, query: ${JSON.stringify(this.query)}`)

    var type = this.params.type
    var Models = typeObj[type]
    if( !type || !Models) {
        return yield this.render('error', {
            message: 'must choose one type',
            error: {status: 204, stack: 'no content' }
        })
    }

    yield this.render('settings/new', {
        title: type,
        type: type,
        editError : this.query.editError,
        setting : {
          "_action" : "new"
        }
    })
}


exports.show = function *(next){
    logger.info(`${this.method} /settings/:id/:type => show, query: ${JSON.stringify(this.query)}, params: ${JSON.stringify(this.params)}`)

    var type = this.params.type
    var Models = typeObj[type]
    if( !type || !Models) {
        return yield this.render('error', {
            message: 'must choose one type',
            error: {status: 204, stack: 'no content' }
        })
    }

    var id = this.params.id

    var setting = yield Models.findById(id)

    if (!setting) {
        yield this.render('error', {
            message: 'no this setting',
            error: {status: 204, stack: 'no content' }
        })
    }else {
        yield this.render('settings/show', {
            title: type,
            type: type,
            setting : setting
        })
    }
}

exports.edit = function *(next){
    logger.info(`${this.method} /settings/:id/edit/:type => edit, query: ${JSON.stringify(this.query)}, params: ${JSON.stringify(this.params)}`)

    var type = this.params.type
    var Models = typeObj[type]
    if( !type || !Models) {
        return yield this.render('error', {
            message: 'must choose one type',
            error: {status: 204, stack: 'no content' }
        })
    }

    var id = this.params.id

    var setting = yield Models.findById(id)
    if (!setting) {
        yield this.render('error', {
            message: 'no this setting',
            error: {status: 204, stack: 'no content' }
        })
    }else {
        setting._action = 'edit'

        yield this.render('settings/edit', {
            title: type,
            type: type,
            editError : this.query.editError,
            setting : setting
        })
    }
}

exports.create = function *(next){
    logger.info(`${this.method} /settings/:type => create, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)}, body: ${JSON.stringify(this.request.body)}`)

    var type = this.params.type
    var Models = typeObj[type]
    if( !type || !Models) {
        return yield this.render('error', {
            message: 'must choose one type',
            error: {status: 204, stack: 'no content' }
        })
    }

    var editError = _getEditError(this.request.body)

    if (editError) {
        this.redirect(`/settings/new/${type}?editError=${editError}`)
    } else {
        try {
            var setting = yield Models.create(this.request.body)
            this.redirect(`/settings/${setting.id}/${type}`)
        } catch(err) {
            editError = err.message
            this.redirect(`/settings/new/${type}?editError=${editError}`)
        }
    }
}

exports.update = function *(next){
    logger.info(`${this.method} /settings/:id/:type => update, query: ${JSON.stringify(this.query)}, params: ${JSON.stringify(this.params)}, body: ${JSON.stringify(this.request.body)}`)

    var type = this.params.type
    var Models = typeObj[type]
    if( !type || !Models) {
        return yield this.render('error', {
            message: 'must choose one type',
            error: {status: 204, stack: 'no content' }
        })
    }

    var id = this.params.id

    var editError = _getEditError(this.request.body)

    if (editError) {
        this.body = ({
            data:{},
            status:{
                code : 1,
                msg  : editError
            }
        })
    } else {
        try {
            yield Models.update(
                this.request.body, /* set attributes' value */
                { where: { id: id }} /* where criteria */
            )

            this.body = ({
                data:{
                    redirect : `/settings/${id}/${type}`
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
    logger.info(`${this.method} /settings/:id/:type => destroy, query: ${JSON.stringify(this.query)}, params: ${JSON.stringify(this.params)}, body: ${JSON.stringify(this.request.body)}`)

    var type = this.params.type
    var Models = typeObj[type]
    if( !type || !Models) {
        return yield this.render('error', {
            message: 'must choose one type',
            error: {status: 204, stack: 'no content' }
        })
    }

    var id = this.params.id

    yield Models.destroy({
        where: {
            id: id
        }
    })

    yield this.body= ({
        data:{},
        status:{
            code : 0,
            msg  : 'delete success!'
        }
    })
}

var _getEditError = (body) => {
    const title = validator.trim(body.title)

    var editError

    if ([title].some(function (item) { return item === ''})) {
        editError = 'There will not fill in the information'
    }
    return editError
}

//// -- custom
exports.api = {
    select: function *(next){
        logger.info(`${this.method} /api/data/:table/:field/:id => select, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)}`)

        const table = this.params.table,
            field = this.params.field,
            id = this.params.id,
            model = typeObj[table]

        var data = {
            success: false,
            message: 'Enjoy your token!'
        }, editError

        if (model) {
            var instance = yield model.findById(id, {
                attributes :[field]
            })

            if (instance) {
                var value = instance[field]
                if (value) {
                    data.result = value
                    data.success = true
                } else {
                    editError = 'not this field'
                }
            } else {
                editError = 'not this id instance'
            }
        } else {
            editError = 'not this table'
        }

        if(editError){
            data.message = editError
            this.body = apiFormat.api_error(data)
        } else {
            this.body = apiFormat.api(data)
        }

    }
}

