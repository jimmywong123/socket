"use strict";

const Sequelize = require('sequelize')
const tools = require('../common/tools')
const Enumeration = require('../common/enumeration')
var db = require('../../db')


var User = db.define('user', {
    username: {type: Sequelize.STRING, allowNull: false},
    password: {type: Sequelize.STRING, allowNull: false, },
    lastAt: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW,},
    openid: {type: Sequelize.STRING},
    unionid: {type: Sequelize.STRING},
    isLock: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false,},
    avatar: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    roleType: {
        type:   Sequelize.INTEGER,
        allowNull: false,
        defaultValue: Enumeration.roleType[3].value,
        get: function() {
            return this.getDataValue('roleType') || 0
        }
    },
},{
    indexes: [
        // Create a unique index on username,password
        {
            unique: true,
            fields: ['username','password']
        },
        {
            unique: true,
            fields: ['openid']
        },
        {
            unique: true,
            fields: ['unionid']
        }
    ],
    getterMethods   : {
        roleTypeTitle : function() { return Enumeration.roleType[this.roleType].title},
        lastAtFormat : function() { return tools.formatDate(this.lastAt) },
        createdAtFormat: function() { return tools.formatDate(this.createdAt) },
        updatedAtFormat: function() { return tools.formatDate(this.updatedAt) },
    },
})

module.exports = User



