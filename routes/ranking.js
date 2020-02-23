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

// 首页的每日热点
router.get('/api/hot',(req,res) => {
    hot(req,res,86400000)
})
router.get('/api/week',(req,res) =>{
    ranking(req,res,604800000)
})
router.get('/api/mouth',async (req,res) =>{
    ranking(req,res,2592000000)
})
router.get('/api/year',async (req,res) =>{
    ranking(req,res,31536000000)
})

// 排行函数
async function ranking(req,res,updateTime){
    let time = req.query.time
    let pretime = time-updateTime
    // createTime:{$gt:pretime,$lt:time} 查询到的数据按点赞数量倒序排列，并且最多只返回20条数据
    let allArticle = await Article.find({isDel:"0",createTime:{$gt:pretime,$lt:time}}).sort({likeNum:-1}).limit(20)
    let articleArr = []
    for(let i=0;i<allArticle.length;i++){
        let userId  = allArticle[i].userId
        let user = await User.findById(userId)
        let article = allArticle[i]
        let articleInfo ={
            avatar:user.avatar,
            nickName:user.nickName,
            createTime:article.createTime,
            title:article.blogTitle,
            _id : article._id,
            userId : userId
        }
        articleArr.push(articleInfo)
    }
    res.json({
        article:articleArr,
        code:0
    })
}

// 从24小时内发表文章点赞量最多的中抽出5个为热点资讯
async function hot(req,res,updateTime){
    let time = req.query.time
    let pretime = time-updateTime
    // createTime:{$gt:pretime,$lt:time} 查询到的数据按点赞数量倒序排列，并且最多只返回20条数据
    let allArticle = await Article.find({isDel:"0",createTime:{$gt:pretime,$lt:time}}).sort({likeNum:-1}).limit(5)
    let articleArr = []
    for(let i=0;i<allArticle.length;i++){
        let userId  = allArticle[i].userId
        let user = await User.findById(userId)
        let article = allArticle[i]
        let articleInfo ={
            avatar:user.avatar,
            nickName:user.nickName,
            createTime:article.createTime,
            title:article.blogTitle,
            likeNum:article.likeNum,
            conmmentNum:article.comment.length,
            content:article.content,
            _id : article._id,
            userId : userId
        }
        articleArr.push(articleInfo)
    }
    res.json({
        article:articleArr,
        code:0
    })
}
module.exports = router
