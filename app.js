var express = require('express')
var path = require('path')
var cors = require('cors')
require('./mongoDB/connect')
var sessionRouter = require('./routes/session')
var articalRouter = require('./routes/operationArticle')
var rankingRouter = require('./routes/ranking')
var updateInfoRouter = require('./routes/updateInfo')
var focusRouter = require('./routes/focus')
var commentRouter = require('./routes/comment-router')
var session = require('express-session')//session 默认为一个对象  添加到req请求头中

var app = express()
var expressWs = require('express-ws')(app)
app.use(session({
  secret: 'keyboard cat',//配置加密字符串  会在原有加密基础之上和该字符串拼接起来加密
  resave: false,
  saveUninitialized: true,//为true时 代表是否使用session 都会默认分配一个cookie
  cookie: { secure: true }
}))
app.use(express.static(path.join(__dirname, './public/')))
app.use(express.static('./uploads/'))
app.use(express.static(path.join(__dirname, './node_modules/')))
app.use(cors())//设置跨域
app.use(express.json())
app.use(sessionRouter) //登录注册路由
app.use(articalRouter) //博文操作路由 
app.use(rankingRouter) //文章排行路由
app.use(updateInfoRouter)//修改用户个人信息router
app.use(focusRouter)//关注及收藏路由
app.use(commentRouter)//文章评论及回复路由

app.listen(5000, function () {
  console.log("server is running port:5000");
})