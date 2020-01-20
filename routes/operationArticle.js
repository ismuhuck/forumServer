//  文章操作接口
var express = require('express')
var User = require('../model/user')
var Article = require('../model/article')
const auth = require('./auth')
var router = express.Router()
// 由于mongodb中的_id为对象格式，数据传递时转化为了json格式， 通过参数从前端传递过来的id也为字符串类型  所以要通过ObjectId进行转换
var ObjectId = require('mongodb').ObjectId

//  code 0: 成功 1：失败 2:点赞成功 3：取消点赞 4: 未发表任何文章 5：进入坛主的主页
router.post('/api/createArticle', auth, async (req, res) => {
    let date = new Date()
    // 将标准时间转化为时间戳，用于读取数据库时的排序问题
    let time = date.getTime()
    let article = await Article.create(
        {
            blogTitle: req.body.blogTitle,
            content: req.body.content,
            userId: req.user._id,
            createTime: time,
        }
    )
    if (!article) {
        return res.json({
            code: 1,
            msg: '发表失败'
        })
    }
    res.status(200).send({
        content: article,
        code: 0
    })
})
// 不使用async异步函数的写法
// 个人主页获取个人全部文章接口
router.get('/api/getArticle', auth, (req, res) => {
    let id = req.user._id
    Article.find({ userId: id, isDel: '0' }, (err, docs) => {
        if (!err) {
            return res.json(docs)
        }
    })
    //  return res.json(allArticle)
})

// 获取当前坛主的粉丝数关注数，与文章详情分离
router.get('/api/tanzhu', async (req, res) => {
    let user = await User.findById(req.query.userId)
    let allArticle = await Article.find({ userId:ObjectId(req.query.userId) , isDel: '0' })
    if (!allArticle) {
        return res.status(200).json({
            code: 4,
            msg: '没有查询到文章信息'
        })
    }
    let collecting = user.collecting
    // 当用户删除一篇其他用户收藏的文章时，其他用户的收藏数减1
    let collectingArr =[]
    for(let i = 0; i<collecting.length; i++){
        // 获取所有收藏的文章id
        let id = collecting[i].articleid
        let article =await Article.findOne({isDel:'0',_id:id})
        if(!article) continue;
        collectingArr.push(id)
    }
    let tanzhu ={
        focusNum:user.focus.length,
        collectingNum:collectingArr.length,
        likemeNum:user.likeme.length,
        allarticlesNum:allArticle.length
    }
    res.status(200).json({
        code: 0,
        tanzhu:tanzhu 
    })
})


// 进入文章详情页面
router.get('/api/thisArticle', async (req, res) => {
    let article = await Article.findById(req.query.articleId)
    let userID = ObjectId(req.query.userId)
    // 文章主 个人信息
    let user = await User.findById(userID)
    // 返回到前端的文章主信息
    let userInfo = {
        avatar:user.avatar,
        nickName:user.nickName,
        qianming:user.qianming,
        _id:user._id
    }
    if(!article){
        return res.status(200).json({
            user:userInfo,
            code:5
        })
    }
    // 获取评论列表及评论相关人信息
    let commentArr = article.comment
    let comment = []
    for(let i=0; i<commentArr.length; i++){
        let id = commentArr[i].userId
        let user = await User.findById(id)
        let userInfo = {}
        userInfo.avatar = user.avatar
        userInfo.nickName = user.nickName
        userInfo.comment = commentArr[i].comment
        userInfo.commentTime = commentArr[i].commentTime
        userInfo.commentID = commentArr[i].commentID
        let reply = commentArr[i].reply
        let replyList =[]
        for(let j=0;j<reply.length;j++){
            let user_id = reply[j].userID //回复人ID
            let comment_id = reply[j].commentuserID//被回复人Id
            // console.log(comment_id)
            let user__id = await User.findById(user_id)
            let comment__id = await User.findById(comment_id)
            let obj ={
                userNickname:user__id.nickName,
                commentNickname:comment__id.nickName,
                content:reply[j].replycontent,
                replyTime:reply[j].replyTime,
                commentID:reply[j].commentID
            }
            replyList.push(obj)
        }
        userInfo.reply=replyList
        comment.push(userInfo)
    }
    
    // 文章标题和文章内容
    let articleInfo = {
        title:article.blogTitle,
        content:article.content
    }
    res.status(200).json({
        article: articleInfo,
        user: userInfo,
        code: 0,
        comment:comment
    })
})

// 获取点赞列表

router.get('/api/likeList', async (req,res) => {
    let article = await Article.findById(req.query.articleId)
    let likeArr = article.like
    let like = []
    for(let i =0; i < likeArr.length; i++){
        let id = likeArr[i]
        let user = await User.findById(id)
        let avatar = user.avatar
        like.push(avatar)
    }
    res.json({
        like:like
    })
})

// 文章点赞
router.post('/api/like', auth, async (req, res) => {
    // 文章ID
    let articleId =ObjectId(req.body.articleId) 
    // 当前登陆者的ID
    let userId = req.user._id
    let article = await Article.findById(articleId)
    let thisUser = await User.findById(userId)
    let likeArticle = thisUser.likeArticle
    let likeArr = article.like
    let flag = likeArr.some((item, i) => {
        return item.toString() === userId.toString()
    })
    if (!flag) {
        likeArr.unshift(userId)
        let thislikeArticle ={
            articleId:articleId,
            likeArticleTime:new Date().getTime()
        }
        likeArticle.unshift(thislikeArticle)
        await Article.updateOne({ _id: articleId }, {
            $set: {
                like: likeArr
            }
        })
        await User.updateOne({_id:userId},{
            $set:{
                likeArticle:likeArticle
            }
        })
        let newArticle = await Article.findById(articleId)
        let likeUser = newArticle.like
        let avatarArr = []
        for (let i = 0; i < likeUser.length; i++) {
            // 获取当前所有点赞者的id
            let id = likeUser[i]
            let user = await User.findById(id)
            let avatar = user.avatar
            avatarArr.push(avatar)
        }
        return res.status(200).json({
            code: 2,
            articleInfo: avatarArr
        })
    }
    for (let i=0; i<likeArticle.length;i++){
        let articleid = likeArticle[i].articleId
        if(articleid.toString()===articleId.toString()){
            likeArticle.splice(i,1)
            await User.updateOne({_id:userId},{
                $set:{
                    likeArticle:likeArticle
                }
            })
        }
    }
    for (let i = 0; i < likeArr.length; i++) {
        let userid = likeArr[i]
        if (userid.toString() === userId.toString()) {
            likeArr.splice(i, 1)
            await Article.update({ _id: articleId }, {
                $set: {
                    like: likeArr
                }
            })
            let newArticle = await Article.findById(articleId)
            let likeUser = newArticle.like
            let avatarArr = []
            for (let i = 0; i < likeUser.length; i++) {
                // 获取当前所有点赞者的id
                let id = likeUser[i]
                let user = await User.findById(id)
                let avatar = user.avatar
                avatarArr.push(avatar)
            }
            return res.status(200).json({
                code: 3,
                msg: '取消点赞',
                articleInfo: avatarArr
            })
        }
    }
})


// 文章收藏
router.post('/api/shoucang', auth, async (req, res) => {
    let articleId = req.body.articleId
    let userId = req.user._id
    let article = await Article.findById(articleId)
    let collectingArr = req.user.collecting
    let flag = collectingArr.some((item, i) => {
        return item.articleid.toString() === articleId.toString()
    })
    if (!flag) {
        let collecting = req.user.collecting
        let likeObj = {
            title: article.blogTitle,
            articleid: articleId,
            likeTime:new Date().getTime()
        }
        collecting.push(likeObj)
        await User.update({ _id: userId }, {
            $set: {
                collecting: collecting
            }
        })
        let newUser = await User.findById(userId)
        return res.status(200).json({
            code: 2,
            userInfo: newUser
        })
    }
    for (let i = 0; i < collectingArr.length; i++) {
        let { articleid: newarticleid } = collectingArr[i]
        if (newarticleid.toString() === articleId.toString()) {
            collectingArr.splice(i, 1)
            await User.update({ _id: userId }, {
                $set: {
                    collecting: collectingArr
                }
            })
            let newUser = await User.findById(userId)
            return res.status(200).json({
                code: 3,
                msg: '取消收藏',
                userInfo: newUser
            })
        }
    }
})

//  文章删除
router.post('/api/deleted', auth, async (req, res) => {
    let id = req.body._id
    await Article.update({ _id: id }, {
        $set: {
            isDel: '1'
        }
    })
    res.status(200).json({
        code: 0,
        msg: '删除成功'
    })

})

// 文章搜索
router.post('/api/search',async (req, res) => {
    const searchdata = req.body.searchtext
    const reg = new RegExp(searchdata,'i')
    // 多条件查询  如果文章的题目和内容有匹配到reg则该条记录被返回，并且只返回该条记录 题目、内容、拥有该篇文章的用户的用户id，记录的_id默认返回
    let articles =await Article.find({$or:[{blogTitle:{$regex:reg}},{content:{$regex:reg}}],isDel:'0'},{blogTitle:1,content:1,userId:1,createTime:1} )
    let user =await User.find({nickName:{$regex:reg}},{nickName:1,avatar:1,qianming:1})
    res.json({
        msg:'调用成功',
        article:articles,
        user:user
    })
})
module.exports = router