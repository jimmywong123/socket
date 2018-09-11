'use strict'

require('./init')
require('./db')
require('./config/global')


const path = require('path')
const Koa = require('koa')
const convert = require('koa-convert')
const mountRoutes = require('./app/common/mount-koa-routes')
const $middlewares = require('mount-middlewares')(__dirname)

const app = new Koa()

app.keys = [Config.session_secret]

// middlewares
app.use(convert($middlewares.compress))//http传输压缩
app.use(convert($middlewares.bodyparser))//request body解析器
app.use(convert($middlewares.session))//保存session信息
app.use(convert($middlewares.helmet))//提高http安全性
//app.use(convert($middlewares.csrf))
app.use(convert($middlewares.json))//美化json输出
app.use(convert($middlewares.serve))//静态资源服务
app.use(convert($middlewares.views))//指定页面渲染层
app.use(convert($middlewares.favicon))//网页图标
app.use(convert($middlewares.cors))//支持跨域请求
app.use(convert($middlewares.less))//css预处理
//app.use(convert($middlewares.auth.authUser))//用户操作，session存储，权限验证
//app.use(convert($middlewares.auth.blockUser))


app.use(convert($middlewares.log4js))//日志
app.use(convert($middlewares.request_logger))//统计request响应时间


// for production
if (process.env.NODE_ENV === 'production') {
    app.use(convert($middlewares.static_cache))

    // mount routes from app/routes folder
    mountRoutes(app, path.join(__dirname, 'app/routes'), false)
} else if (process.env.NODE_ENV === 'test') {
    // for test
    console.log('test')

    // mount routes from app/routes folder
    mountRoutes(app, path.join(__dirname, 'app/routes'), true)
} else {
    // mount routes from app/routes folder
    mountRoutes(app, path.join(__dirname, 'app/routes'), true)
}

// response
app.on('error', function (err, ctx) {
    console.log(err)
})

module.exports = app
