var express = require('express')
var User = require('../model/user')
var Article = require('../model/article ')
const auth = require('./auth')

var router = express.Router()
//  code 0: 成功 1：失败
router.post('/api/createArticle',auth,async (req,res) =>{
    let article =await Article.create(
        {
            content:req.body.content,
            userId:req.user._id
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
module.exports = router