var express = require('express')
var User = require('../model/user')
var Article = require('../model/article')
var auth = require('./auth')
let router = express.Router()
var ObjectId = require('mongodb').ObjectId 

// 文章评论
router.post('/api/commentText', auth, async (req, res) => {
    let body = req.body
    let article = await Article.findById(body.articleId)
    let commentObj = {
        comment: body.comment,
        userId: req.user._id,
        commentID:new Date().getTime()+req.user._id.toString(),//评论id为当前时间戳加上当前评论的用户id
        commentTime:new Date().getTime(),
        reply:[]//子评论列表
    }
    let comment = article.comment
    comment.push(commentObj)
    await Article.update({ _id: body.articleId }, {
        $set: {
            comment: comment
        }
    })
    res.status(200).json({
        code: 0
    })
})

// 文章子评论
router.post('/api/commentson',auth,async (req,res) => {
    let body = req.body
    let articleId = ObjectId(body.articleId)
    let userID = req.user._id //当前登陆者的id 
    let article = await Article.findById(articleId)
    let commentList = article.comment
    for(let i=0;i<commentList.length;i++){
        let commentuserID = commentList[i].userId //要回复的评论的评论主ID   被回复人id
        let replyComment = {
            commentuserID:commentuserID,//被回复人id
            userID:userID,//回复人id
            replycontent:body.replycontent,
            replyTime:new Date().getTime(),//回复时间
            commentID:new Date().getTime()+userID.toString()//当前子评论的唯一标识
        }
        if( commentList[i].commentID === body.commentID){
            commentList[i].reply.push(replyComment)
        }
    }
    await Article.updateOne({_id:articleId},{$set:{
        comment:commentList
    }})
    res.json({
        code:0,
        msg:'回复成功',
    })
})

// 文章子评论回复
router.post('/api/commentsun',auth,async(req,res) =>{
    let body = req.body
    let articleId = ObjectId(body.articleId)
    let userID = req.user._id //当前登陆者的id 
    let article = await Article.findById(articleId)
    let commentList = article.comment
    for(let i=0;i<commentList.length;i++){
        let reply = commentList[i].reply
        let commentObj = {}
        for(let j=0;j<reply.length;j++){
            if(reply[j].commentID === body.commentID){
                let ID = reply[j].userID // 子评论被回复人ID
                let id = userID //回复人ID
                commentObj.commentuserID = ID
                commentObj.userID = id
                commentObj.replycontent=body.replycontent
                commentObj.replyTime = new Date().getTime()
                commentObj.commentID = new Date().getTime()+userID.toString()
                break;
            }
        }
        if(commentList[i].commentID === body.zhucommentID){
            commentList[i].reply.push(commentObj)
        }
    }
    await Article.updateOne({_id:articleId},{$set:{
        comment:commentList
    }})
    res.status(200).json({
        code:0,
        msg:'回复成功'
    })
})

module.exports = router
