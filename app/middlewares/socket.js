/**
 * Created by user on 22/6/15.
 */
"use strict"
const server = require('../../bin/www').server
const io = require('socket.io')(server)
const socketList = {};//每个用户所持有的与服务器交互的socket列表
var logger = require('../common/logger')()

//const $models = require('mount-models')(__dirname)

/**
 *
 */
exports.on = function *(next) {
    console.log('middle');
    yield next

    // io.on('connection', function(socket){
    //     console.log('connection');
    //     // socket.on('queryLastContacts', function(msg) {//查看最近的联系人列表
    //     //     let ip = 'baidu';//socket.handshake.headers.origin
    //     //     //console.log(socket.handshake);
    //     //     //存储该用户socket
    //     //     socketList[ip+'-'+msg.senderId] = socket;
    //     //     //查询最近聊天的最后一条信息 
            
    //     // });

    //     // socket.on('queryChat', function(msg) {//查看最近的聊天信息
    //     //     console.log(msg.groupId);
    //     // });

    //     // socket.on('sendMsg', function(msg) {//发送信息
    //     //     //完善msg，将msg存入数据库
    //     //     msgs[0] = msg;
    //     //     //将信息发送给接收者
    //     //     if(socketList[socket.handshake.headers.origin+'-'+msg.receiverId]){
    //     //         socketList[socket.handshake.headers.origin+'-'+msg.receiverId].emit('newMsg',msg);
    //     //     }
    //     // });


    // });
}
