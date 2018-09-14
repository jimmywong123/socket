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
    this.hiredChinaIo = socketIo(server, { pingTimeout: 30000 }).of('/hiredchina');
    ioListen(this.hiredChinaIo);
  }
}

function ioListen(io) {
  io.on('connection', (socket) => {
    //查看最近的联系人列表
    socket.on('queryLastContacts', async function (msg, callBack) {
      log.info(`queryLastContacts======${socket.id}`)

      let sender = await cache.get(socket.handshake.headers.cookie.split('io=')[1].split(';')[0]) || await cache.get(socket.handshake.headers.referer.split('token=')[1]);
      msg.senderId = sender.id;
      msg.ip = sender.ip;
      sender.status = 'online';//在线

      if (!msg.lastTime) {
        //将此用户socket统一放入此房间
        socket.join(`${msg.ip}-${msg.senderId}`)
        //通知所有用户上线
        socket.broadcast.emit('changeStatus', sender);
      }

      let transaction, groups;
      try {
        transaction = await db.transaction();

        groups = await groupService.queryLastContacts(msg, transaction);
        for (let i = 0; i < groups.length; i++) {
          let msgList = await msgService.queryNoRead(msg.ip, msg.senderId, groups[i].id, transaction)
          groups[i].dataValues.noRead = msgList.length;
          // 查询这些用户是否有socket在线
          io.in(`${groups[i].dataValues.userList[0].ip}-${groups[i].dataValues.userList[0].id}`).clients((error, clients) => {
            clients.length > 0 ? groups[i].dataValues.userList[0].status = 'online' : groups[i].dataValues.userList[0].status = 'offline'
          });

        }
        if (msg.lastTime)
          callBack(groups, sender.id, false);//返回联系人列表给客户端,false代表不是最新的聊天群
        else
          callBack(groups, sender.id, true);//返回联系人列表给客户端，true表示是最新的聊天群
        transaction.commit();
      } catch (error) {
        transaction.rollback();
        log.info(error);
      }
      await msgService.addTest();
    });

    //查看最近的聊天信息
    socket.on('queryChat', async function (msg, callBack) {
      log.info(`queryChat======${socket.id}`)

      let transaction, msgs;
      try {
        transaction = await db.transaction();
        msgs = await msgService.queryChat(msg, transaction);
        // //删除中间表user_msg的未读数据
        // if (msg.noRead > 0) {
        //   let sender = await cache.get(socket.handshake.headers.cookie.split('io=')[1].split(';')[0]) || await cache.get(socket.handshake.headers.referer.split('token=')[1]);
        //   await msgService.deleteNoRead(msg, sender, transaction);
        // }
        //返回消息列表给客户端
        if (msg.createDate)//查询某时间点之前的消息需客户端带上createDate，查询后返回isNew=false给客户端
          callBack(msgs, false);
        else
          callBack(msgs, true);//查询最新的消息时，客户端发送的createDate属性为空
        transaction.commit();
      } catch (error) {
        transaction.rollback();
        log.info(error);
      }
    });
    //接收客户端发送的信息
    socket.on('sendMsg', async function (msg, callBack) {//发送信息
      log.info(`sendMsg======${socket.id}`)

      let sender = await cache.get(socket.handshake.headers.cookie.split('io=')[1].split(';')[0]) || await cache.get(socket.handshake.headers.referer.split('token=')[1]);
      //完善msg，将msg存入数据库
      msg.ip = sender.ip;
      msg.senderId = sender.id;
      msg.createDate = new Date();
      msg.sender = sender;

      let transaction, receiverIds;
      try {
        transaction = await db.transaction();
        //将消息存入msg表，更新group的last
        let tempMsg = await msgService.addMsg(msg, transaction);
        msg.id = tempMsg.id;
        let group = await groupService.findById(msg.groupId, transaction);
        group.lastContent = msg.content;
        group.lastName = sender.userName;
        group.lastTime = msg.createDate;
        await groupService.update(group, transaction);
        //获取此群下接收者的用户id
        receiverIds = await socketUserService.findByGroupId(msg, transaction);
        for (i in receiverIds) {
          await msgService.setNoRead(msg.id, receiverIds[i].id, transaction);//将此消息设置为接收者的未读消息
          //查询接收者在此群下有多少未读消息
          let msgList = await msgService.queryNoRead(msg.ip, receiverIds[i].id, msg.groupId, transaction)
          msg.noRead = msgList.length;
          socket.to(`${sender.ip}-${receiverIds[i].id}`).emit('newMsg', msg);//将消息发送给接收者
        }
        callBack(msg, true);
        transaction.commit();
      } catch (error) {
        transaction.rollback();
        log.info(error);
      }
    });
    //监听用户离线事件
    socket.on('disconnect', async (reason) => {
      log.info(`disconnect======${socket.id}======${reason}`)
      try {
        let sender = await cache.get(socket.handshake.headers.cookie.split('io=')[1].split(';')[0]);
        if (sender != null) {
          //查询该用户是否还有socket连接
          io.in(`${sender.ip}-${sender.id}`).clients((error, clients) => {
            clients.length > 0 ? sender.status = 'online' : sender.status = 'offline'
            //通知所有人下线
            if (sender.status == 'offline')
              socket.broadcast.emit('changeStatus', sender);
          });
        }
      } catch (error) {
      }
    });

    //监听查询未读数事件
    socket.on('queryNoRead', async (msg, callBack) => {
      log.info(`queryNoRead======${socket.id}`)

      let sender = await cache.get(socket.handshake.headers.cookie.split('io=')[1].split(';')[0]) || await cache.get(socket.handshake.headers.referer.split('token=')[1]);
      sender.status = 'online';
      socket.join(`${sender.ip}-${sender.id}`)
      //通知所有人上线
      socket.broadcast.emit('changeStatus', sender);

      let transaction, num;
      try {
        transaction = await db.transaction();
        num = await msgService.queryNoReadById(sender.id, transaction);
        callBack(num);
        transaction.commit();
      } catch (error) {
        transaction.rollback();
        log.info(error);
      }
    });

    //监听用户已读事件
    socket.on('haveRead', async (msg, callBack) => {
      log.info(`haveRead======${socket.id}`)
      let sender = await cache.get(socket.handshake.headers.cookie.split('io=')[1].split(';')[0]) || await cache.get(socket.handshake.headers.referer.split('token=')[1]);
      let transaction;
      try {
        transaction = await db.transaction();
        await msgService.deleteNoRead(msg, sender, transaction);
        callBack();
        transaction.commit();
      } catch (error) {
        transaction.rollback();
        log.info(error);
      }
    });
  })
}

exports.socketServer = socketServer