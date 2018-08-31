const db = require('../../db')
const $models = require('mount-models')(__dirname)
const group = $models.group;
const socketUser = $models.socketUser;
const msg = $models.msg;
const tools = require('../common/tools.js');
const Op = db.Op;

/**
 * 查询出最近聊天的群信息
 * @param {*} ip 发送者的ip地址
 * @param {*} senderId 发送者的id
 */
exports.queryLastContacts = async function (ip, msg, transaction) {
    //查询此用户最近聊天的10个群id
    let option = {
        attributes: ['id', 'lastTime'],
        include: [{
            model: socketUser,
            attributes: ['id'],
            as: 'userList',
            where: { ip: ip, originalId: msg.senderId },
        }],
        order: [
            ['lastTime', 'desc']
        ],
        limit: 10,
        transaction: transaction
    };
    if (msg.lastTime)
        option.where = { lastTime: { $lt: msg.lastTime } };
    let recentGroupList = await group.findAll(option)
    let groupIds = recentGroupList.map(item => item.id)
    //查询出这些群的信息及群下的用户信息
    let groupList = await group.findAll({
        include: [{
            model: socketUser,
            attributes: ['originalId', 'name', 'img'],
            as: 'userList',
            where: { originalId: { $ne: msg.senderId } },
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
    }, {
            where: { id: updateGroup.id },
            transaction: transaction
        });
};