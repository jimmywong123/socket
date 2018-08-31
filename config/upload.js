
var path = require('path')

var config = {
    upload: {
        path: path.join(__dirname, 'public/upload/'),
        url: '/public/upload/'
    },
    qn_access: {
        accessKey: 'jJ-JtPwQFVy6ul7dr5Ycc_GXo9ws7cZPTLmiolxh',
        secretKey: 'plfMTxvHEoASxlxSHhZlhCz8Xhe7LDT8nnEHLvN2',
        bucket: 'socket',
        uploadURL: 'http://up.qiniu.com/',
        origin: 'http://pebhgx1ut.bkt.clouddn.com'
    },
}

module.exports = config