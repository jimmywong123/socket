'use strict'


const fs = require('fs')
const path = require('path')
const logPath = path.join(__dirname, 'logs')

const log4js = require('koa-log4')


/**
 * 创建log目录
 */
function _createLogDirectory (logPath) {
    var isExist = fs.existsSync(logPath)

    if (isExist !== true) {
        console.info('log_path is not exist, create folder:' + logPath)
        try {
            fs.mkdirSync(logPath)
        } catch (e){
            console.error('Could not set up log directory, error was: ', e)
        }

    } else {
        console.info('log_path is exist, no operation!')
    }
}

function main () {
    //_createLogDirectory(logPath)
    log4js.configure(path.join(__dirname, 'config/log4js.json'))
}

// 程序入口
main()
