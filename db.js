'use strict'


const Sequelize = require('sequelize');
const co = require('co');


const config = require('./config/mysql')
const logger = require('./app/common/logger')(__filename.replace(__dirname, ''))
const tools = require('./app/common/tools')

var db = new Sequelize(config.database, config.user, config.password, config)

db.authenticate().then( (err) => {
    if (err) {
        logger.info('[mysql log] Error connecting to: ' + config.host + '. ' , err)
        return process.exit(1)
    } else {
        return logger.info('[mysql log] Successfully connected to: ' + config.host)
    }
}).catch((err) => {
    logger.info('[mysql log] Error connecting to: ' + config.host + '. ' , err)
    return process.exit(1)
})


//db.sync()

// Force sync all models

//co(function *(){
//    var result = yield db.sync({force: true})
//    var password = yield tools.bhash(`admin##${Config.session_secret}##admin123`)
//
//    yield result.models.user.create({username: 'admin'
//        , password: password
//        , roleType: Enumeration.roleType[0].value})
//
//}).catch( (err) => {
//    logger.info('[mysql log] init errer : ', err)
//})


module.exports = db


