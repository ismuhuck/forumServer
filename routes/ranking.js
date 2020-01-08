// 排行榜接口
var express = require('express')
var User = require('../model/user')
var Article = require('../model/article ')

let router = express.Router()

router.get('/api/default',async (req,res) =>{
    let allArticle = await Article.find()
    res.json(
        {
            article:allArticle,
            code:0
        }
    )
})
router.get('/api/week',async (req,res) =>{
    let allArticle = await Article.find()
    res.json({
        article:allArticle,
        code:0
    })
})
router.get('/api/mouth',async (req,res) =>{
    let allArticle = await Article.find()
    res.json({
        article:allArticle,
        code:0
    })
})
router.get('/api/year',async (req,res) =>{
    let allArticle = await Article.find()
    res.json({
        article:allArticle,
        code:0
    })
})

module.exports = router
