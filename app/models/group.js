const Sequelize = require('sequelize')
const tools = require('../common/tools')
const socketUser = require('./socketUser')
var db = require('../../db')

module.exports = db.define('group', {
  //id: {primaryKey:true,type: Sequelize.INTEGER(11),autoIncrement : true},
  name: { type: Sequelize.STRING(50), comment: '群名称，当为私聊时此属性应当为null，因为双方看到的是对方的名字' },
  managerId: { type: Sequelize.INTEGER(11), field: 'manager_id', comment: '群管理员id' },
  isPrivate: { type: Sequelize.BOOLEAN(1), field: 'is_private', comment: '私聊还是群聊，1代表私聊，0代表群聊' },
  img: { type: Sequelize.STRING(1000), comment: '群头像，当为私聊时此属性应当为null，因为互相看到的是对方的头像，当为群聊时此属性不为空，群头像由群成员的组合而成' },
  lastContent: { type: Sequelize.STRING(3072), field: 'last_content', comment: '最后一条消息' },
  type: { type: Sequelize.STRING(1), comment: '消息类型：0文本/1图片/2文件' },
  lastName: { type: Sequelize.STRING(80), field: 'last_name', comment: '最后发送消息的用户名' },
  lastTime: { type: Sequelize.DATE, field: 'last_time', comment: '最后发送时间' },
}, {
    freezeTableName: true, // Model 对应的表名将与model名相同
    timestamps: false,
    underscored: true,
  }
);