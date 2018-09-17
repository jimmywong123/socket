const db = require('../../db')
const $models = require('mount-models')(__dirname)
const group = $models.group;
const socketUser = $models.socketUser;
const msg = $models.msg;
const tools = require('../common/tools');
const Op = db.Op;
const random = require('mockjs').Random


/**
 * 查询该用户在此群的未读信息的id
 * @param {*} ip 发送者ip地址
 * @param {*} groupId 所在群id
 */
exports.queryNoRead = async function (ip, userId, groupId, transaction) {
    return msg.findAll({
        attributes: ['id'],
        include: [{
            model: socketUser,
            attributes: ['id'],
            as: 'userList',
            where: { ip: ip, id: userId },
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
            attributes: ['id', 'originalId', 'name', 'img'],
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

exports.setNoRead = async function (msgId, receiverId, transaction) {
    await db.query(`insert into user_msg(msg_id,user_id) values(${msgId},${receiverId})`, { transaction: transaction });
}

/**
 * 根据用户id查询其有多少条未读信息
 */
exports.queryNoReadById = async function (userId, transaction) {
    let result = await db.query(`select count(user_id) as num from user_msg where user_id =${userId}`, transaction);
    return result[0][0].num;
};

/**
 * 删除此用户的未读数据
 */
exports.deleteNoRead = async function (queryMsg, sender, transaction) {
    let msgs = await db.query(`select id,create_date from msg where group_id = ${queryMsg.groupId} order by create_date desc limit ${queryMsg.noRead}`, { model: msg, transaction: transaction });
    let msgIds = '';
    for (i in msgs)
        i == msgs.length - 1 ? msgIds += msgs[i].id + '' : msgIds += msgs[i].id + ','
    msgIds == '' ? null : await db.query(`delete from user_msg where user_id = ${sender.id} and msg_id in (${msgIds})`, { transaction: transaction });
};

/**
 * 添加测试数据
 */
exports.addTest = async function () {
    for (let i = 0; i < 250000; i++) {
        let text = random.paragraph(1);
        await db.query(`insert into msg(id,sender_id,group_id,content,type,create_date) values(default,1,1,'${text}',0,now());`);
        text = random.paragraph(1);
        await db.query(`insert into msg(id,sender_id,group_id,content,type,create_date) values(default,1,2,'${text}',0,now());`);
        text = random.paragraph(1);
        await db.query(`insert into msg(id,sender_id,group_id,content,type,create_date) values(default,1,3,'${text}',0,now());`);
        text = random.paragraph(1);
        await db.query(`insert into msg(id,sender_id,group_id,content,type,create_date) values(default,1,4,'${text}',0,now());`);
    }
};