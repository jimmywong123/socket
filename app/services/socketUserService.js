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