"use strict"

const validator = require('validator')

const log = require('../common/logger')(__filename.replace(__dirname, ''))
const tools = require('../common/tools')
const cache = require('../common/cache')
const socketList = require('../../bin/www').socketList

//const $models = require('../common/mount-models')(__dirname)

//const User = $models.user


exports.sendMsg = async function(){
    console.log(this);
    let msg = this.request.body;
    // let socket = await cache.get(`${this.host}-${msg.id}`);
    // await socket.emit('test','123');
    let socket = socketList[`${this.host}-${msg.id}`];
    socket.emit('test','123');
}
