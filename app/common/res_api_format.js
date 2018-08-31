
const logger = require('./logger')(__filename.replace(__dirname, ''))

exports.api = (...arguments) => {
    var http_code,api_data,api_status

    if (arguments.length == 1) {
        http_code = 200
        api_data      = arguments[0]
        api_status    = {
            code : 0,
            msg  : 'request success!'
        }
    } else if (arguments.length == 2) {
        http_code = 200
        api_data      = arguments[0]
        api_status    = arguments[1]

    } else if (arguments.length == 3) {
        http_code = arguments[0]
        api_data      = arguments[1]
        api_status    = arguments[2]

    } else {
        http_code = 200
        api_data = {}
        api_status = {
            code: 222222222,
            msg: 'res.api params error or res is not a express.response object!'
        }
    }
    var json = _api(http_code, api_data, api_status)
    logger.debug(`${JSON.stringify(json)}`)
    return json


    function _api (http_code, data, status) {
        return {
            data    : data,
            status  : status
        }
    }
}

exports.api_error = (data) => {
    var _error_code = 200
    var _error_status_code = -1
    var _error_status_msg = 'api error'

    return exports.api(_error_code, data, {
        code : _error_status_code,
        msg  : _error_status_msg
    })
}