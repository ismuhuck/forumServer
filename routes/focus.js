// 关注接口
const auth = require('./auth')
// const Article = require('../model/article')
var Article = require('../model/article')
const User = require('../model/user')
const express = require('express')
var ObjectId = require('mongodb').ObjectId
var router = express.Router()

//code：1 不可关注自己 2 关注成功、粉丝加一 3 取消关注 粉丝减一 8 已关注 9 未关注  10 已收藏 11 未收藏 12 暂时没有点赞的文章
// 13 您还没有关注的人 14 您还没有粉丝 15 您还没有收藏的文章

// 关注接口
router.post('/api/focus',auth,async (req,res) => {
    let user = req.user
    let userId = user._id
    let focusArr = user.focus
    // 博主ID
    let userID =ObjectId(req.body.userId) 
    if(userID.toString() === user._id.toString()){
        return res.status(200).json({
            code:1,
            msg:'您不可关注自己'
        })
    }
    let flag = focusArr.some((item,i) => {
        return item._id.toString() === userID.toString()
    })
    if(!flag){
        let focusInfo = {
            _id:userID,
            focusTime:new Date().getTime()
        }
        focusArr.push(focusInfo)
        await User.updateOne({_id:userId},{$set:{
            focus:focusArr
        }})
        let newUser = await User.findById(userId)
        return res.status(200).json({
            code:2,
            msg:'关注成功'
        })
    }
    for(let i = 0; i<focusArr.length; i++){
        let {_id:userid} = focusArr[i]
        if(userid.toString() === userID.toString()){
            focusArr.splice(i,1)
            await User.updateOne({_id:userId},{
                $set:{
                    focus:focusArr
                }
            })
            let newUser = await User.findById(userId)
            return res.status(200).json({
                code:3,
                msg:'取消关注'
            })
    }}
})

// 粉丝
router.post('/api/likeme',auth,async (req,res) => {
    let user = req.user
    // 当前登录用户 ID
    let userId = user._id
    // 要关注的坛主ID
    let id = ObjectId(req.body._id) 
    let tanzhu = await User.findById(id)
    let likemeArr = tanzhu.likeme
    let flag = likemeArr.some((item,i) => {
        return item._id.toString() === userId.toString()
    })
    if(!flag){
        let likemeInfo = {
            _id:userId,
            likemeTime:new Date().getTime()
        }
        likemeArr.push(likemeInfo)
        await User.updateOne({_id:id},{$set:{
            likeme:likemeArr
        }})
        return res.status(200).json({
            code:2,
            msg:'粉丝加一'
        })
    }
    for(let i = 0; i<likemeArr.length; i++){
        let {_id:userid} = likemeArr[i]
        if(userid.toString() === userId.toString()){
            likemeArr.splice(i,1)
            await User.updateOne({_id:id},{
                $set:{
                    likeme:likemeArr
                }
            })
            return res.status(200).json({
                code:3,
                msg:'粉丝减一'
            })
    }}
})

router.post('/api/liketext',auth,(req,res) => {
    res.status(200).json({
        code:0
    })
})

// 获取关注列表接口  从数据库中查询 实现数据的双向更新

router.get('/api/focus',auth,async (req , res) => {
    let focus = req.user.focus
    let focusArr = []
    for(let i = 0; i<focus.length; i++){
        // 获取到关注人的id
        let id = focus[i]._id
        let focusUser = await User.findById(id)
        let userInfo = {}
        userInfo.avatar = focusUser.avatar
        userInfo.nickName = focusUser.nickName
        userInfo.qianming = focusUser.qianming
        userInfo._id = focusUser._id
        userInfo.focusTime = focus[i].focusTime
        focusArr.unshift(userInfo)
    }
    res.json({
        user:focusArr
    })
})
// 获取文章收藏列表接口
router.get('/api/collecting', auth, async (req , res) => {
    let collecting = req.user.collecting
    let collectingArr = []
    for(let i = 0; i<collecting.length; i++){
        // 获取文章id
        let id = collecting[i].articleid
        let collectingArticle = await Article.findOne({isDel:"0",_id:id,statusCode:0})
        // 当collectingArticle为空时跳出本次循环，不为空时继续后面的操作
        if(!collectingArticle) continue;
        let articleInfo = {}
        articleInfo.title = collectingArticle.blogTitle
        articleInfo.content = collectingArticle.content
        articleInfo._id = collectingArticle._id
        articleInfo.userId = collectingArticle.userId
        articleInfo.likeTime = collecting[i].likeTime
        collectingArr.unshift(articleInfo)
    }
    res.json({
        collecting:collectingArr
    })
})

// 获取粉丝列表

router.get('/api/likeme', auth, async ( req, res) => {
    let likeme = req.user.likeme
    let likemeArr = []
    for(let i = 0; i<likeme.length; i++){
        // 获取到粉丝的id
        let id = likeme[i]._id
        let likemeUser = await User.findById(id)
        let userInfo = {}
        userInfo.avatar = likemeUser.avatar
        userInfo.nickName = likemeUser.nickName
        userInfo.qianming = likemeUser.qianming
        userInfo._id = likemeUser._id
        userInfo.likemeTime = likeme[i].likemeTime
        likemeArr.unshift(userInfo)
    }
    res.json({
        user:likemeArr
    })
})

// 获取点赞的文章列表

router.get('/api/likeArticle',auth, async (req , res) => {
    let likeArticle = req.user.likeArticle
    let likeArr = []
    for(let i=0;i<likeArticle.length;i++){
        let id = likeArticle[i].articleId
        let article = await Article.findOne({_id:id,isDel:'0',statusCode:0})
        if(!article) continue;
        let articleInfo = {
            title:article.blogTitle,
            content:article.content,
            _id:article._id,
            userId:article.userId,
            likeArticleTime:likeArticle[i].likeArticleTime
        }
        likeArr.push(articleInfo)
    }
    // console.log(typeof(likeArr.length))
    // if(likeArr.length===0){
    //     return res.status(200).json({
    //         code:12
    //     })
    // }
    return res.status(200).json({
        code:0,
        likeArticle:likeArr
    })
})

// 关注人的文章列表

router.get('/api/focusArticles',auth,async (req, res) => {
    let userId = ObjectId(req.query.userId)
    let allArticles = await Article.find({userId:userId,isDel:'0',statusCode:0})
    let allArticlesArr = []
    for(let i = 0;i<allArticles.length;i++){
        let articles = allArticles[i]
        let articlesObj ={
            title:articles.blogTitle,
            content:articles.content,
            createTime :articles.createTime,
            userId:articles.userId,
            _id:articles._id
        }
        allArticlesArr.unshift(articlesObj)
    }
    res.json({
        code:0,
        articles:allArticlesArr
    })
})

// 获取关注状态

router.get('/api/facusStatus',auth, async (req, res) => {
    let id = req.user._id  // 当前登录者的id
    let userId =ObjectId(req.query.userId)  // 坛主的id
    let user = await User.findById(id)
    let focusArr = user.focus
    let flag = focusArr.some((item,index) => {
        return item._id.toString() === userId.toString()
    }) 
    if(flag){
        return res.status(200).json({
            code:8,
            msg:'已关注'
        })
    }
    else{
        return res.status(200).json({
            code:9,
            msg:'未关注'
        })
    }
})

// 获取收藏状态

router.get('/api/collectingStatus', auth, async (req, res) => {
    let id = req.user._id  // 当前登录者的id
    let articleId =ObjectId(req.query.articleId)  // 文章的id
    let user = await User.findById(id)
    let collectingArr = user.collecting
    let flag = collectingArr.some((item,index) => {
        return item.articleid.toString() === articleId.toString()
    })
    if(flag){
        return res.status(200).json({
            code:10,
            msg:'已收藏'
        })
    }
    else{
        return res.status(200).json({
            code:11,
            msg:'取消收藏'
        })
    }
})

// 获取点赞状态
 router.get('/api/likeStatus', auth, async ( req, res) =>{
     let id = req.user._id
     let articleId = ObjectId(req.query.articleId)
     let likeArr = req.user.likeArticle
     let flag = likeArr.some((item,index) => {
         return item.articleId.toString() === articleId.toString()
     })
     if(flag){
         return res.status(200).json({
             code:12,
             msg:'已点赞'
         })
     }
     else{
         return res.status(200).json({
             code:13,
             msg:'取消点赞'
         })
     }
 })

module.exports = router