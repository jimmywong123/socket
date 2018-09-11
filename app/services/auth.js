const logger = require('../common/logger')(__filename.replace(__dirname, ''))
const apiFormat = require('../common/res_api_format')
const validator = require('validator')

exports.check = function (body, baseCheckRequest = {err,json}){
    const username = validator.trim(body.username || '').toLowerCase()
    const password = validator.trim(body.password || '')

    var editError,
        returnData,
        data = {
            success: false,
            message: 'Enjoy your data!'
        }
    if (!username) {
        editError = 'Please enter the username'
    } else if (!password) {
        editError = 'Please enter the password'
    }

    if (!editError) {
        var err = baseCheckRequest.err,
            json = baseCheckRequest.json
        
        if (err) {
            editError = err
        } else {
            if (json.data && json.data.success){
                data = json.data
            } else {
                editError = json.data.message
            }
        }
    }

    if (editError) {
        data.message = editError
        returnData = apiFormat.api_error(data)
    } else {
        returnData = apiFormat.api(data)
    }

    return returnData
}