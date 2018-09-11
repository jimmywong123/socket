"use strict"

const jwt = require('jsonwebtoken')
const validator = require('validator')

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const apiFormat = require('../common/res_api_format')
const tools = require('../common/tools')
const api = require('../common/api')

const auth = require('../middlewares/auth')
const authServices = require('../services/auth')
const groupService = require('../services/groupService');
const socketUserService = require('../services/socketUserService');
const cache = require('../common/cache')
const db = require('../../db')

// -- custom api
exports.api = {
    auth: async function () {
        logger.info(`${this.method} /api/auth => auth, query: ${JSON.stringify(this.query)} , params: ${JSON.stringify(this.params)} , body: ${JSON.stringify(this.request.body)}`)

        let parameter = this.request.body;
        let username, password;
        let sender = {};
        let receiver = {};
        let group = {};

        var editError,
            data = {
                success: false,
                message: 'Enjoy your data!'
            }
        try {
            username = parameter.username;
            password = parameter.password;
            sender.originalId = parameter.senderId;
            sender.name = parameter.senderName;
            sender.img = parameter.senderImg;
            sender.ip = parameter.ip;
            receiver.originalId = parameter.receiverId;
            receiver.name = parameter.receiverName;
            receiver.img = parameter.receiverImg;
            receiver.ip = parameter.ip;
        } catch (error) {
            logger.info(error);
            editError = 'Please enter the username or password';
        }

        if (!username) {
            editError = 'Please enter the username'
        } else if (!password) {
            editError = 'Please enter the password'
        }

        if (!editError) {
            if (!(username === Config.appId && password === Config.appSecret)) {
                editError = 'the username or password error'
            }
        }

        if (editError) {
            data.message = editError
            this.body = apiFormat.api_error(data)
        } else {
            var new_token = jwt.sign({ username: username, password: password }, Config.session_secret, {
                expiresIn: 60 * 60 * 6 // 设置过期时间6小时
            })
            data.success = true;
            data.token = new_token;

            let transaction, tempSender, tempReceiver;
            try {
                transaction = await db.transaction();
                //在数据库查询有没有这两个用户的信息，如果没有则新建用户
                tempSender = await socketUserService.checkExist(sender, transaction);
                if (tempSender == null)
                    sender = await socketUserService.create(sender, transaction);
                else
                    sender.id = tempSender.id;
                tempReceiver = await socketUserService.checkExist(receiver, transaction);
                if (tempReceiver == null)
                    receiver = await socketUserService.create(receiver, transaction);
                else
                    receiver.id = tempReceiver.id;
                //在数据库查询这两个用户之前有没有建过私聊群，如果没有则新建私聊群
                if (!await groupService.checkExist(sender, receiver, transaction)) {
                    group.managerId = sender.id;
                    group.isPrivate = 1;
                    group.lastTime = new Date();
                    await groupService.create(group, sender, receiver, transaction);
                }
                transaction.commit();
            } catch (error) {
                transaction.rollback();
                logger.info(error);
            }

            cache.set(new_token, sender, 60 * 60 * 12);
            this.body = apiFormat.api(data)
        }
    }
}

