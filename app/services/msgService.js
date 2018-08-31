const db = require('../../db')
const $models = require('mount-models')(__dirname)
const group = $models.group;
const socketUser = $models.socketUser;
const msg = $models.msg;
const tools = require('../common/tools');
const Op = db.Op;
/**
 * 查询该用户的未读信息的id
 * @param {*} ip 发送者ip地址
 * @param {*} senderId 用户的id
 * @param {*} groupId 所在群id
 */
exports.queryNoRead = async function (ip, senderId, groupId, transaction) {
    return msg.findAll({
        attributes: ['id'],
        include: [{
            model: socketUser,
            attributes: ['id'],
            as: 'userList',
            where: { ip: ip, originalId: senderId },
        }, {
            model: group,
            attributes: ['id'],
            as: 'belong',
            where: { id: groupId },
        }],
        transaction: transaction
    })
};

/**
 *  查询此群最近的聊天信息
 */
exports.queryChat = async function (queryMsg, transaction) {
    let option = {
        attributes: ['id', 'senderId', 'content', 'type', 'createDate'],
        include: [{
            model: socketUser,
            attributes: ['originalId', 'name', 'img'],
            as: 'sender',
        }],
        order: [
            ['createDate', 'desc']
        ],
        where: { groupId: queryMsg.groupId },
        limit: 10,
        transaction: transaction
    };
    if (queryMsg.createDate)
        option.where.createDate = { $lt: queryMsg.createDate };
    return msg.findAll(option);
}

exports.addMsg = async function (queryMsg, transaction) {
    return msg.create(queryMsg, { transaction: transaction });
}