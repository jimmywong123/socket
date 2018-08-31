/**
 * Created by user on 20/9/15.
 */
"use strict"

const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const fs     = require('fs')
const gm     = require('gm')
const store  = require('../common/store_qn')
const tools  = require('../common/tools')

exports.upload = function *(next){
    logger.info(`${this.method} /upload => upload, query: ${JSON.stringify(this.query)},
    params: ${JSON.stringify(this.params)} ,
    body: ${JSON.stringify(this.request.body)},
    fields: ${JSON.stringify(this.request.fields)},
    files: ${JSON.stringify(this.request.files)}`)

    var upload = function(_file,_filename){
        return new Promise(function(resolve, reject){
            store.upload(_file, {filename: _filename}, function (err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result.url)
            })
        })
    }

    const files = this.request.files
    var requestFile
    if (tools.isArray(files)) {
        requestFile = files[0]
    } else {
        requestFile = files.avatar_file
    }

    const filename = requestFile.name
    const path = requestFile.path
    var orgFile = fs.createReadStream(path)
    var file = orgFile

    logger.debug(`filename: ${filename} , path: ${path}`)

    // const fields = this.request.fields
    // const avatar_data = JSON.parse(fields.avatar_data)
    // const x = avatar_data.x
    // const y = avatar_data.y
    // const height = avatar_data.height
    // const width = avatar_data.width
    // const rotate = avatar_data.rotate

    // logger.debug(`x: ${x}, y: ${y}, height: ${height}, width: ${width}, rotate: ${rotate}`)

    // file = gm(orgFile)
    //     .rotate('#fff',rotate)
    //     .crop(width, height, x, y)
    //     .stream()

    try {
        var url = yield upload(file,filename)
        logger.debug(`${this.method} /upload => upload, url: ${url}`)
        this.body = {
            state: 200,
            result: url, //url
        }
    } catch (err) {
        logger.debug(`${this.method} /upload => upload, err: ${JSON.stringify(err)}`)
        this.body = {
            state: 200,
            message : err
        }
    }
}
