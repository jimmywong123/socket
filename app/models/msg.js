const Sequelize = require('sequelize')
const tools = require('../common/tools')
var db = require('../../db')

module.exports = db.define('msg', {
  //id: {primaryKey:true,type: Sequelize.INTEGER(11),autoIncrement : true,},
  //ip: { type: Sequelize.STRING(20), allowNull: false, comment: '发送消息的ip地址' },
  senderId: { type: Sequelize.INTEGER(11), field: 'sender_id', allowNull: false, comment: '发送消息的用户id' },
  //receiverId: { type: Sequelize.INTEGER(11), field: 'receiver_id', comment: '接收消息的id，当为群聊时此栏可为空' },
  groupId: { type: Sequelize.INTEGER(11), field: 'group_id', comment: '发送群消息时的群id' },
  content: { type: Sequelize.STRING(1020), comment: '内容' },
  type: { type: Sequelize.INTEGER(1), comment: '信息类型：0文本/1图片/2文件' },
  createDate: { type: Sequelize.DATE(6), field: 'create_date', comment: '发送时间' },
}, {
    freezeTableName: true, // Model 对应的表名将与model名相同
    timestamps: false,
    tableName: 'msg',
    underscored: true
  },
);

//module.exports = Msg;