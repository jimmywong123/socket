const socketIo = require('socket.io')
const groupService = require('../services/groupService');
const msgService = require('../services/msgService');
const socketUserService = require('../services/socketUserService');
const db = require('../../db')
const cache = require('../common/cache')
const tools = require('../common/tools');
const log = require('../common/logger')()
const circularJson = require('circular-json');

class socketServer {
  constructor(server) {
    //this.usersNumber = 0
    this.socketList = {};
    this.io = socketIo(server)
  }
  ioListen() {
    var that = this;
    that.io.on('connection', (socket) => {
      //查看最近的联系人列表
      socket.on('queryLastContacts', async function (msg) {
        let sender = await cache.get(msg.token);
        let ip = sender.ip;
        msg.senderId = sender.originalId;
        //存储该用户socket
        that.socketList[`${ip}-${msg.senderId}`] = socket;

        let transaction, groups;
        try {
          transaction = await db.transaction();
          groups = await groupService.queryLastContacts(ip, msg, transaction);
          for (let i = 0; i < groups.length; i++) {
            let msgList = await msgService.queryNoRead(ip, msg.senderId, groups[i].id, transaction)
            groups[i].dataValues.noRead = msgList.length;
          }
          transaction.commit();
        } catch (error) {
          transaction.rollback();
          log.info(error);
        }
        if (msg.lastTime)
          socket.emit('lastContacts', groups, false);//返回联系人列表给客户端,false代表不是最新的聊天群
        else
          socket.emit('lastContacts', groups, true);//返回联系人列表给客户端，true表示是最新的聊天群
      });

      //查看最近的聊天信息
      socket.on('queryChat', async function (msg) {
        let transaction, msgs;
        try {
          transaction = await db.transaction();
          msgs = await msgService.queryChat(msg, transaction);
          //删除中间表user_msg的相关数据

          transaction.commit();
        } catch (error) {
          transaction.rollback();
          log.info(error);
        }
        //返回消息列表给客户端
        if (msg.createDate != undefined)//查询某时间点之前的消息需客户端带上createDate，查询后返回isNew=false给客户端
          socket.emit('lastChat', msgs, false);
        else
          socket.emit('lastChat', msgs, true);//查询最新的消息时，客户端发送的createDate属性为空
      });
      //接收客户端发送的信息
      socket.on('sendMsg', async function (msg) {//发送信息
        let sender = await cache.get(msg.token);
        //完善msg，将msg存入数据库
        msg.ip = sender.ip;
        msg.senderId = sender.originalId;
        msg.createDate = new Date();

        let transaction, receiverIds;
        try {
          transaction = await db.transaction();
          //将消息存入msg表，更新group的last
          await msgService.addMsg(msg, transaction);
          let group = await groupService.findById(msg.groupId, transaction);
          group.lastMsg = msg.content;
          group.lastName = msg.userName;
          group.lastTime = msg.createDate;
          await groupService.update(group, transaction);
          //获取发送者originalId,name,img
          msg.sender = await socketUserService.findByOriginalId(msg.senderId, transaction);
          //获取此群下的用户id
          receiverIds = await socketUserService.findByGroupId(msg.groupId, transaction);
          transaction.commit();
        } catch (error) {
          transaction.rollback();
          log.info(error);
        }
        //将信息发送给接收者
        for (let i in receiverIds) {
          if (that.socketList[`${msg.ip}-${receiverIds[i].originalId}`])
            that.socketList[`${msg.ip}-${receiverIds[i].originalId}`].emit('newMsg', msg);
          else {//不在线的用户需要把这条信息设置为它的未读消息

          }
        }
      });
    })
  }
}

exports.socketServer = socketServer