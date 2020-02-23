// 管理端程序接口
let express = require('express')
let User = require('../model/user')
let Admin = require('../model/admin')
let Article = require('../model/article.js')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
let router = express.Router()
let ObjectId = require('mongodb').ObjectId
const SECRET = 'password'

async function users (req,res,code){
    let users = await User.find({statusCode:code})
    let userList = []
    for(let i=0;i<users.length;i++){
        let user = users[i]
        let userObj = {
            startTime:user.startTime,
            nickName:user.nickName,
            avatar:user.avatar,
            email:user.email,
            _id:user._id
        }
        userList.push(userObj)
    }
    res.json({
        code:0,
        userList
    })
}
// 获取正常状态用户
router.get('/api/allUser',(req,res) => {
    users(req,res,0)
})
// 待审核用户
router.get('/api/wait',(req,res) => {
    users(req,res,4)
})
// 获取禁言用户列表
router.get('/api/jinyan', (req, res) => {
    users(req,res,1)
})
// 获取删除用户列表
router.get('/api/delUserlist', (req, res) => {
    users(req,res,3)
})
// 已拒绝用户
router.get('/api/passUser', (req, res) => {
    users(req,res,5)
})
// 审核数量
router.get('/api/userCount',async (req,res) => {
    let length =await User.find({statusCode:4}).count()
    res.json({
        length:length
    })
})
// 通过注册审核
router.get('/api/pass',async (req,res) => {
    let _id = req.query.id
    let user = await User.findByIdAndUpdate(_id,{$set:{statusCode:0}},{new:true})
    res.json({
        code:0,
        msg:'注册已通过'
    })
})
// 拒绝通过注册
router.get('/api/down',async (req,res) => {
    let _id = req.query.id
    let user = await User.findByIdAndUpdate(_id,{$set:{statusCode:5}},{new:true})
    res.json({
        code:0,
        msg:'注册已拒绝'
    })
})
// 添加管理员
router.post('/api/addAdmin',async (req,res) => {
    let isadmin = await Admin.findOne({userName:req.body.userName})
    if(isadmin) {
        return res.json({
            code:1,
            msg:'该用户已经存在'
        })
    } 
    let admin = await Admin.create({
        userName:req.body.userName,
        password:req.body.password
    })
    res.json({
        code:0,
        msg:'注册成功'
    })
})
// 用户禁言
router.get('/api/noSend',async ( req, res) => {
    let _id = req.query.id
    let user =await User.findByIdAndUpdate(_id,{$set:{statusCode:1}},{new:true})
    res.json({
        code:0,
        msg:'禁言成功'
    })
})
// 删除用户
router.get('/api/delUser',async ( req, res) => {
    let _id = req.query.id
    let user = await User.findByIdAndUpdate(_id,{$set:{statusCode:3}},{new:true})
    res.json({
        code:0,
        msg:'删除成功'
    })
})
// 取消禁言
router.get('/api/canceljinyan', async (req,res) => {
    let _id = req.query.id
    let user = await User.findByIdAndUpdate(_id,{$set:{statusCode:0}},{new:true})
    res.json({
        code:0,
        msg:'禁言已取消'
    })
})
// 恢复用户
router.get('/api/cancelUser', async (req,res) => {
    let _id = req.query.id
    let user = await User.findByIdAndUpdate(_id,{$set:{statusCode:0}},{new:true})
    res.json({
        code:0,
        msg:'用户状态已恢复'
    })
})
// 管理员登录
router.post('/api/adminLogin',async (req,res) => {
    const admin = await Admin.findOne({
        userName:req.body.userName
    })    
    if(!admin){
        res.status(200).json({
            msg:"用户不存在",
            code:1
        })
    }
    const ispassaword = bcrypt.compareSync(req.body.password,admin.password) //验证密码 返回一个布尔值
     //生成token
    var token = jwt.sign({
        id:String(admin._id)
    },SECRET)
    if(!ispassaword){
        return res.status(200).json({
            msg:"密码错误",
            code:1
        })
    }
    res.json({
        admin:admin.userName,
        token,
        code:0
    })
})
router.get('/api/articles_all',async (req,res) => {
    let articles = await Article.find({isDel:"0",statusCode:0})
    let article_list = []
    for(let i =0;i<articles.length;i++){
        let userID = articles[i].userId;
        let user = await User.findById(userID)
        let article_obj ={
            title:articles[i].blogTitle,
            createTime:articles[i].createTime,
            content:articles[i].content,
            nickName:user.nickName,
            article_id:articles._id
        }
        article_list.push(article_obj)
    }
    res.json({
        article_list
    })
})
router.get('/api/Hour',async (req,res) =>{
        let time = req.query.time
        let pretime = time-3600000
        // 查询一个小时内的新文章
        let allArticle = await Article.find({isDel:"0",statusCode:0,createTime:{$gt:pretime,$lt:time}})
        let article_list = []
        for(let i=0;i<allArticle.length;i++){
            let userId  = allArticle[i].userId
            let user = await User.findById(userId)
            let article = allArticle[i]
            let articleInfo ={
                nickName:user.nickName,
                createTime:article.createTime,
                title:article.blogTitle,
                content:article.content,
                _id : article._id,
                userId : userId
            }
            article_list.push(articleInfo)
        }
        res.json({
            article_list,
            code:0
        })
})
router.get('/api/delArticles',async ( req, res) => {
    let articles = await Article.find({isDel:'1'})
    let article_list = []
    for(let i =0;i<articles.length;i++){
        let userID = articles[i].userId;
        let user = await User.findById(userID)
        let article_obj ={
            title:articles[i].blogTitle,
            createTime:articles[i].createTime,
            content:articles[i].content,
            nickName:user.nickName,
            article_id:articles[i]._id
        }
        article_list.push(article_obj)
    }
    res.json({
        article_list
    })
})
router.get('/api/stopArticles',async ( req, res) => {
    let articles = await Article.find({statusCode:1})
    let article_list = []
    for(let i =0;i<articles.length;i++){
        let userID = articles[i].userId;
        let user = await User.findById(userID)
        let article_obj ={
            title:articles[i].blogTitle,
            createTime:articles[i].createTime,
            content:articles[i].content,
            nickName:user.nickName,
            article_id:articles[i]._id,
            userId:articles[i].userId,
            userstatusCode:user.statusCode
        }
        
        article_list.push(article_obj)
    }
    res.json({
        article_list,
    })
})

// 暂停展示接口
router.get('/api/stop',async (req,res) => {
    let _id = ObjectId(req.query.id)
    let article = await Article.findByIdAndUpdate(_id,{$set:{statusCode:1}},{new:true})
    res.json({
        code:0
    })
})
// 删除接口
router.get('/api/delArticle',async (req,res) => {
    let _id = ObjectId(req.query.id)
    let article = await Article.findByIdAndUpdate(_id,{$set:{statusCode:2,isDel:'1'}},{new:true})
    res.json({
        code:0,
        msg:'删除成功'
    })
})
// 恢复接口
router.get('/api/showArticle',async (req,res) => {
    let _id = ObjectId(req.query.id)
    let article = await Article.findByIdAndUpdate(req.query.id,{$set:{statusCode:0}},{new:true})
    // let article = await Article.findByIdAndUpdate(_id,{$set:{statusCode:0}},{new:true})
    res.json({
        code:0,
        msg:'恢复成功',
        article
    })
})
// 彻底删除文章接口 
router.get('/api/del',async (req,res) => {
    let _id = ObjectId(req.query.id)
    let article = await Article.deleteOne({_id:_id})
    res.json({
        code:0,
        msg:'删除成功'
    })
})
module.exports = router