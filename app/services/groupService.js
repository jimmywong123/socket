const db = require('../../db')
const $models = require('mount-models')(__dirname)
const group = $models.group;
const socketUser = $models.socketUser;
const msg = $models.msg;
const tools = require('../common/tools.js');
const Op = db.Op;

/**
 * 查询出最近聊天的群信息
 */
exports.queryLastContacts = async function (msg, transaction) {
    //查询此用户最近聊天的10个群id
    let option = {
        attributes: ['id', 'lastTime'],
        include: [{
            model: socketUser,
            attributes: ['id'],
            as: 'userList',
            where: { ip: msg.ip, id: msg.senderId },
        }],
        order: [
            ['lastTime', 'desc']
        ],
        transaction: transaction
    };
    if (msg.lastTime)
        option.where = { lastTime: { $lt: msg.lastTime } };
    let recentGroupList = await group.findAll(option)
    let groupIds = recentGroupList.map(item => item.id)
    groupIds = groupIds.slice(0, 30);
    //查询出这些群的信息及群下的用户信息
    let groupList = await group.findAll({
        include: [{
            model: socketUser,
            attributes: ['id', 'ip', 'name', 'img'],
            as: 'userList',
            where: { id: { $ne: msg.senderId } },
        }],
        where: { id: groupIds },
        order: [
            ['lastTime', 'desc']
        ],
        transaction: transaction
    })
    return groupList;
};

exports.findById = async function (id, transaction) {
    return group.findById(id, { transaction: transaction });
};

exports.update = async function (updateGroup, transaction) {
    return group.update({
        lastContent: updateGroup.lastContent,
        lastName: updateGroup.lastName,
        lastTime: updateGroup.lastTime,
        type: updateGroup.type
    }, {
            where: { id: updateGroup.id },
            transaction: transaction
        });
};

/**
 * 根据两个用户originalId查询之前是否有建过私聊群
 * @param {*} senderId 
 * @param {*} receiverId 
 * @param {*} transaction 
 */
exports.findBySenderAndReceiver = async function (sender, receiver, transaction) {
    let sql = `select gu.group_id as id from socket_user su left join group_user gu on su.id = gu.user_id 
    where su.original_id = ${receiver.originalId} and gu.group_id in
    (select gu.group_id from socket_user su left join group_user gu on su.id = gu.user_id
    left join \`group\` g on g.id = gu.group_id where g.is_private = 1 and su.original_id = ${sender.originalId}
    and su.ip = '${sender.ip}')`;
    return await db.query(sql, { model: group, transaction: transaction });
};

exports.create = async function (createGroup, sender, receiver, transaction) {
    let tempGroup = await group.create(createGroup, { transaction: transaction });
    await db.query(`insert into group_user(group_id,user_id) values(${tempGroup.id},${sender.id})`, { transaction: transaction });
    await db.query(`insert into group_user(group_id,user_id) values(${tempGroup.id},${receiver.id})`, { transaction: transaction });
    return tempGroup;
};

exports.queryRooms = async function (msg, transaction) {
    return db.query(`select group_id as id from group_user where user_id = ${msg.senderId}`, { model: group, transaction: transaction });
};