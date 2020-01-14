// 排行榜接口
var express = require('express')
var User = require('../model/user')
var Article = require('../model/article')

let router = express.Router()

router.get('/api/default',async (req,res) =>{
    let allArticle = await Article.find({isDel:"0"}).sort({createTime:-1})
    let articleArr = []
    for(let i = 0; i<allArticle.length; i++){
        let userId  = allArticle[i].userId
        let user = await User.findById(userId)
        let articleInfo = {}
        articleInfo.avatar = user.avatar
        articleInfo.nickName = user.nickName
        let article = allArticle[i]
        articleInfo.title = article.blogTitle
        articleInfo.createTime = article.createTime
        articleInfo._id = article._id
        articleInfo.userId = userId
        // console.log(typeof(articleInfo.userId))
        articleArr.push(articleInfo)
    } 
    res.json(
        {
            article:articleArr,
            code:0
        }
    )
})


router.get('/api/week',async (req,res) =>{
    let allArticle = await Article.find({isDel:"0"})
    res.json({
        article:allArticle,
        code:0
    })
})
router.get('/api/mouth',async (req,res) =>{
    let allArticle = await Article.find({isDel:"0"})
    res.json({
        article:allArticle,
        code:0
    })
})
router.get('/api/year',async (req,res) =>{
    let allArticle = await Article.find({isDel:"0"})
    res.json({
        article:allArticle,
        code:0
    })
})

module.exports = router
