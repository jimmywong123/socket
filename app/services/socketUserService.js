const db = require('../../db')
const $models = require('mount-models')(__dirname)
const group = $models.group;
const socketUser = $models.socketUser;
const msg = $models.msg;
const tools = require('../common/tools');
const Op = db.Op;

/**
 * 根据群id查询出此群下的用户originalId
 * @param {*} groupId 群id
 * @param {*} transaction 事物
 */
exports.findByGroupId = async function (msg, transaction) {
    return socketUser.findAll({
        attributes: ['id'],
        include: [{
            model: group,
            attributes: ['id'],
            as: 'groupList',
            where: { id: msg.groupId },
        }],
        where: { id: { $ne: msg.senderId } },
        transaction: transaction
    })
};

// exports.findByOriginalId = async function (originalId, transaction) {
//     return socketUser.findOne({
//         attributes: ['originalId', 'name', 'img'],
//         where: { originalId: originalId },
//         transaction: transaction
//     })
// };

/**
 * 根据originalId查询用户是否存在，如果不存在会返回null
 * @param {*} originalId 
 * @param {*} transaction 
 */
exports.checkExist = async function (user, transaction) {
    return socketUser.findOne({
        attributes: ['id'],
        where: { originalId: user.originalId, ip: user.ip },
        transaction: transaction
    })
};

/**
 * 新增socketuser
 * @param {*} user 
 * @param {*} transaction 
 */
exports.create = async function (user, transaction) {
    return socketUser.create(user, { transaction: transaction });
};

/**
 * 更新用户状态为在线或离线
 */
exports.update = async function (updateUser, transaction) {
    return socketUser.update({
        status: updateUser.status
    }, {
            where: { id: updateUser.id },
            transaction: transaction
        });
};