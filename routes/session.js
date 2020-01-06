//用户登录注册路由
var express = require('express')
var User = require('../model/user')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const auth = require('./auth')
// var md5 = require('blueimp-md5')
var router = express.Router()

const SECRET = 'password' // token 自定义加密字段 增加安全性

// const auth = async(req,res,next) => {
//     //配置验证中间件
//     const raw = String(req.headers.authorization).split(" ").pop()
//     const tokenData = jwt.verify(raw,SECRET)//验证token
//     const {id} = tokenData
//     req.user = await User.findById(id)

//     next() //此中间件执行完成之后，继续执行后面的中间件
// }
router.get('/api/file',auth,async (req,res) =>{
    //
    res.json(req.user)
})
router.get('/api/users',async (req,res)=>{
    const users = await User.find()
    res.send(users)
})
//  code:0 登录成功 1: 登录失败  2：邮箱已注册 3：昵称已存在 4:找不到用户信息
router.post('/api/register',async (req,res) => {
    
    var isEmail = await User.findOne({
        email:req.body.email
    })
    var isnickName = await User.findOne({
        nickName:req.body.nickName
    })
    if(isEmail){
        return res.status(200).json({
            msg:"该邮箱已注册",
            code:2
        })
    }
    if(isnickName){
        return res.status(200).json({
            msg:"昵称已存在",
            code:3
        })
    }
    const user =await User.create({
        email:req.body.email,
        nickName:req.body.nickName,
        password:req.body.password
    })
    
    res.send(user)
})
router.post('/api/login',async (req,res) => {
    const user = await User.findOne({
        email:req.body.email
    })    
    if(!user){
        res.status(200).json({
            msg:"用户不存在",
            code:1

        })
    }
    const ispassaword = bcrypt.compareSync(req.body.password,user.password) //验证密码 返回一个布尔值
    //生成token
    var token = jwt.sign({
        id:String(user._id)
    },SECRET)
    if(!ispassaword){
        return res.status(200).json({
            msg:"密码错误",
            code:1
        })
    }
    res.json({
        user,
        token,
        code:0
    })
})
router.get('/api/getUser',auth,(req,res)=>{
    return res.json(req.user)
})
module.exports = router