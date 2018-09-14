const Group = require('./group')
const SocketUser = require('./socketUser')
const Msg = require('./msg');
const db = require('../../db');

Group.belongsTo(SocketUser,{foreignKey:'manager_id',targetKey:'id',onDelete:'CASCADE',as:'manager'});
Group.belongsToMany(SocketUser,{through: 'group_user',foreignKey:'group_id',targetKey:'id',onDelete:'CASCADE',as:'userList'});
SocketUser.belongsToMany(Group,{through: 'group_user',foreignKey:'user_id',targetKey:'id',onDelete:'CASCADE',as:'groupList'});
Group.hasMany(Msg,{as:'msgList'});
Msg.belongsTo(SocketUser,{foreignKey:'sender_id',targetKey:'id',onDelete:'CASCADE',as:'sender'});
Msg.belongsTo(Group,{foreignKey:'group_id',targetKey:'id',onDelete:'CASCADE',as:'belong'});
Msg.belongsToMany(SocketUser, {through: 'user_msg',foreignKey:'msg_id',targetKey:'id',as:'userList',onDelete:'CASCADE'});
SocketUser.belongsToMany(Msg, {through: 'user_msg',foreignKey:'user_id',as:'msgList',onDelete:'CASCADE'});

db.sync();//自动建表，及保存外键到数据库