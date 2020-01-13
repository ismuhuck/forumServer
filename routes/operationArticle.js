//  发表文章接口
var express = require('express')
var User = require('../model/user')
var Article = require('../model/article')
const auth = require('./auth')

var router = express.Router()


//  code 0: 成功 1：失败 2:点赞成功 3：取消点赞 4: 未发表任何文章
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
//  个人主页获取个人全部文章接口
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
    let article = await Article.findById(req.query.articleId)
    let user = await User.findById(article.userId)
    let allArticle = await Article.find({ userId: article.userId, isDel: '0' })
    if (!allArticle) {
        return res.status(200).json({
            code: 4,
            msg: '没有查询到文章信息'
        })
    }
    res.status(200).json({
        code: 0,
        user: user,
        allArticle: allArticle
    })
})


// 进入文章详情页面
router.get('/api/thisArticle', async (req, res) => {
    let article = await Article.findById(req.query.articleId)
    let user = await User.findById(article.userId)
    let allArticle = await Article.find({ userId: article.userId })
    res.status(200).json({
        article: article,
        user: user,
        code: 0,
    })
})

// 文章点赞
router.post('/api/like', auth, async (req, res) => {
    // 文章发表用户ID
    let articleId = req.body.articleId
    // 当前登陆者的ID
    let userId = req.user._id
    let article = await Article.findById(articleId)
    let likeArr = article.like
    console.log(likeArr)
    // console.log(typeof(likeArr[0]))
    let flag = likeArr.some((item, i) => {
        return item.toString() === userId.toString()
    })
    if (!flag) {
        likeArr.unshift(userId)
        await Article.updateOne({ _id: articleId }, {
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
            code: 2,
            articleInfo: avatarArr
        })
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

// 文章评论
router.post('/api/commentText', auth, async (req, res) => {
    let body = req.body
    let article = await Article.findById(body.articleId)
    let commentObj = {
        comment: body.comment,
        userId: req.user._id,
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
            articleid: articleId
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
module.exports = router