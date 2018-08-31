"use strict"
var qn     = require('qn');

var uploadConfig  = require('../../config/upload')

//7牛 client
var qnClient = null;
if (uploadConfig.qn_access && uploadConfig.qn_access.secretKey !== 'your secret key') {
  qnClient = qn.create(uploadConfig.qn_access);
}

module.exports = qnClient;
