var db_setting = {
    host: '127.0.0.1',
    database: 'socket',
    user: 'root',
    password: 'admin',
    dialect: 'mysql',
    //socketPath: '/var/run/mysqld/mysqld.sock',
    port: '3306',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    timestamps: false,
    timezone: '+08:00',
    //logging:false
}

if (process.env.NODE_ENV === 'production') {
    db_setting.database = 'socket'
    db_setting.host = '127.0.0.1'
    db_setting.user = 'root'
    db_setting.password = 'admin'
} else if (process.env.NODE_ENV === 'test') {
    // for test
    db_setting.database = 'socket'
}

module.exports = db_setting