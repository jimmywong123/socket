/* */ 
'use strict';
const WebSocket = require('./lib/WebSocket');
WebSocket.Server = require('./lib/WebSocketServer');
WebSocket.Receiver = require('./lib/Receiver');
WebSocket.Sender = require('./lib/Sender');
module.exports = WebSocket;
