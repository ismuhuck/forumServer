//  发表文章接口
var express = require('express')
var User = require('../model/user')
var Article = require('../model/article')
const auth = require('./auth')

var router = express.Router()
//  code 0: 成功 1：失败 2:点赞成功 3：取消点赞
router.post('/api/createArticle',auth,async (req,res) =>{
    let article =await Article.create(
        {
            blogTitle:req.body.blogTitle,
            content:req.body.content,
            userId:req.user._id,
            userAva:req.user.avatar,
            userNickname:req.user.nickName
        }
    )
    if(!article){
        return res.json({
            code:1,
            msg:'发表失败'
        })
    }
    res.status(200).send({
        content:article,
        code:0
    })
})
// 不使用async异步函数的写法
//  个人主页获取个人全部文章接口
router.get('/api/getArticle',auth,(req,res) =>{
    let id = req.user._id
    Article.find({
        userId:id
    },(err,docs) => {
        if(!err){
            return res.json(docs)
        } 
    }) 
    //  return res.json(allArticle)
})

// 进入文章详情页面
router.get('/api/thisArticle',async (req , res) => {
    let article = await Article.findById(req.query.articleId)
    let user = await User.findById(article.userId)
    res.status(200).json({
        article:article,
        user:user,
        code:0
    })
})

// 文章点赞
router.post('/api/like',auth, async (req,res) =>{
    let articleId = req.body.articleId
    let userId = req.user._id
    let article = await Article.findById(articleId)
    let likeArr = article.like
    let flag = likeArr.some((item,i) => {
        return item.userId.toString() === userId.toString()
    })
    if(!flag){
        let like = article.like
        let likeObj = {
            avatar:req.user.avatar,
            userId:userId
        }
        like.push(likeObj)
        await Article.update({_id:articleId},{
            $set:{
                like:like
            }
        })
        let newArticle = await Article.findById(articleId)
        return res.status(200).json({
            code:2,
            articleInfo:newArticle
        })
    }
        for(let i=0;i<likeArr.length;i++){
        let {userId:userid} = likeArr[i]
        if(userid.toString() === userId.toString()){
            likeArr.splice(i,1)
            await Article.update({_id:articleId},{
                $set:{
                    like:likeArr
                }
            })
            let newArticle = await Article.findById(articleId)
            return res.status(200).json({
                code:3,
                msg:'取消点赞',
                articleInfo:newArticle
            })
        }
    }
})

// 文章评论
router.post('/api/commentText',auth,async (req,res) => {
    let body = req.body
    let article = await Article.findById(body.articleId)
    let commentObj ={
        comment:body.comment,
        userId:req.user._id,
        nickName:req.user.nickName,
        avatar:req.user.avatar
    }
    let comment = article.comment
    comment.push(commentObj)
    await Article.update({_id:body.articleId},{$set:{ 
        comment:comment
    }})
    res.status(200).json({
        code:0
    })
})

module.exports = router