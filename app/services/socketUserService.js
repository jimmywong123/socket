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
exports.findByGroupId = async function (groupId, transaction) {
    return socketUser.findAll({
        attributes: ['originalId'],
        include: [{
            model: group,
            attributes: ['id'],
            as: 'groupList',
            where: { id: groupId },
        }],
        transaction: transaction
    })
};

exports.findByOriginalId = async function (originalId, transaction) {
    return socketUser.findOne({
        attributes: ['originalId', 'name', 'img'],
        where: { originalId: originalId },
        transaction: transaction
    })
};