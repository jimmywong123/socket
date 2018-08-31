const Sequelize = require('sequelize')
const tools = require('../common/tools')
const Group = require('./group')
var db = require('../../db')

module.exports = db.define('socket_user', {
    //id: {primaryKey:true,type: Sequelize.INTEGER(11),autoIncrement : true,},
    ip: {type: Sequelize.STRING(60),comment:'用户所来源的ip地址'},
    originalId: {type: Sequelize.INTEGER(11),field: 'original_id',comment:'用户所在平台的原始id'},
    name: {type: Sequelize.STRING(80),comment:'用户名'},
    img: {type: Sequelize.STRING(1000),comment:'用户头像'},
  }, {
    freezeTableName: true, // Model 对应的表名将与model名相同
    timestamps:false,
    underscored: true,
  }
);

//module.exports = SocketUser;