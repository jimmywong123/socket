const redisConfig = require('../../config/redis')
const Redis = require('ioredis')
const log = require('./logger')(__filename.replace(__dirname,''))

let client = new Redis(redisConfig);

client.on('error',function(err){
    log.error(err);
})

exports = module.exports = client;
