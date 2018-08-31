const redis = require('./redis')
const log = require('./logger')(__filename.replace(__dirname, ''))
const json = require('circular-json');

let get = async function (key) {
    let start = new Date();
    let data = await redis.get(key);

    if (!data)
        return null
    data = json.parse(data);

    let duration = (new Date() - start);
    log.debug(`Cache get ${key} , ${duration} ms`);

    return data;
}
let set = async function (key, value, time) {
    let start = new Date();

    value = json.stringify(value);

    if (!time)
        await redis.set(key, value);
    else
        await redis.setex(key, time, value);
        
    let duration = (new Date() - start);
    log.debug(`Cache set ${key} , ${duration} ms`);
}

exports.get = get;
exports.set = set;