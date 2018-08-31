
var db = require('../../db')
const $models = require('mount-models')(__dirname)

const User = $models.user
const Client = $models.client

var getNotUseClientUser = function *(){
    var sql = `select *
    from
    users
    where
    id not in (
        select userId
    from
    client_user
    )
    and roleType = 2`

    var list = yield db.query(sql, { model: User })
    return list
}

exports.getNotUseClientUser = getNotUseClientUser


var getUserClientId = function *(userId){
    var sql = `select clientId as id from client_user where userId = ${userId}`,id
    var list = yield db.query(sql, { model: Client })
    if (list && list.length > 0) {
        var item = list[0]
        id = item.id
    }
    return id
}

exports.getUserClientId = getUserClientId