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
        let appId, appSecret;
        let sender = {};
        let receiver = {};
        let group = {};

        var editError,
            data = {
                success: false,
                message: 'Enjoy your data!'
            }
        try {
            appId = parameter.appId;
            appSecret = parameter.appSecret;
            sender.originalId = parameter.sender.id;
            sender.name = parameter.sender.username;
            sender.img = parameter.sender.img;
            sender.ip = parameter.sender.ip;
            if (parameter.receiver) {
                receiver.originalId = parameter.receiver.id;
                receiver.name = parameter.receiver.username;
                receiver.img = parameter.receiver.img;
                receiver.ip = parameter.receiver.ip;
            }
        } catch (error) {
            logger.info(error);
            editError = 'Please enter the appId or appSecret';
        }

        if (!appId) {
            editError = 'Please enter the appId'
        } else if (!appSecret) {
            editError = 'Please enter the appSecret'
        }

        if (!editError) {
            if (!(appId === Config.appId && appSecret === Config.appSecret)) {
                editError = 'the username or password error'
            }
        }

        if (editError) {
            data.message = editError
            this.body = apiFormat.api_error(data)
        } else {
            let transaction, tempSender, tempReceiver;
            try {
                transaction = await db.transaction();
                //在数据库查询有没有这两个用户的信息，如果没有则新建用户
                tempSender = await socketUserService.checkExist(sender, transaction);
                if (tempSender == null)
                    sender = await socketUserService.create(sender, transaction);
                else
                    sender.id = tempSender.id;
                if (receiver.originalId && sender.originalId != receiver.originalId) {
                    tempReceiver = await socketUserService.checkExist(receiver, transaction);
                    if (tempReceiver == null)
                        receiver = await socketUserService.create(receiver, transaction);
                    else
                        receiver.id = tempReceiver.id;
                    //在数据库查询这两个用户之前有没有建过私聊群，如果没有则新建私聊群
                    let groups = await groupService.findBySenderAndReceiver(sender, receiver, transaction)
                    if (groups.length == 0) {
                        group.managerId = sender.id;
                        group.isPrivate = 1;
                        group.lastTime = new Date();
                        await groupService.create(group, sender, receiver, transaction);
                    } else
                        sender.curGroup = groups[0];
                }
                transaction.commit();
            } catch (error) {
                transaction.rollback();
                logger.info(error);
            }

            let new_token = jwt.sign({ sender: sender }, Config.session_secret, {
                expiresIn: 60 * 10 // 设置过期时间10分钟
            })
            data.success = true;
            data.token = new_token;

            //cache.set(`${sender.ip}-${sender.id}`, sender, 60 * 60 * 24 * 7)
            // cache.set(new_token, sender, 60 * 60 * 12);
            // if (parameter.ioCookie)
            //     cache.set(parameter.ioCookie, sender, 60 * 60 * 24);
            this.body = apiFormat.api(data)
        }
    }
}

