var express = require('express')
var path = require('path')
var cors = require('cors')
require('./mongoDB/connect')
var sessionRouter = require('./routes/session')
var articalRouter = require('./routes/operationArticle')
var session = require('express-session')//session 默认为一个对象  添加到req请求头中

var app = express()
app.use(session({
  secret: 'keyboard cat',//配置加密字符串  会在原有加密基础之上和该字符串拼接起来加密
  resave: false,
  saveUninitialized: true,//为true时 代表是否使用session 都会默认分配一个cookie
  cookie: { secure: true }
}))

app.use(express.static(path.join(__dirname, './public/')))
app.use(express.static(path.join(__dirname, './node_modules/')))
app.use(cors())//设置跨域
app.use(express.json())
app.use(sessionRouter) //挂载路由模块
app.use(articalRouter)

app.listen(5000, function () {
  console.log("server is running port:5000");
})