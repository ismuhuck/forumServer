// 关注接口
const auth = require('./auth')
// const Article = require('../model/article')
var Article = require('../model/article')
const User = require('../model/user')
const express = require('express')
 
var router = express.Router()

// 关注接口
router.post('/api/focus',auth,async (req,res) => {
    let user = req.user
    let userId = user._id
    let focusArr = user.focus
    let flag = focusArr.some((item,i) => {
        return item._id.toString() === userId.toString()
    })
    if(!flag){
        let focusInfo = {
            nickName:user.nickName,
            avatar:user.avatar,
            _id:user._id
        }
        focusArr.push(focusInfo)
        await User.updateOne({_id:userId},{$set:{
            focus:focusArr
        }})
        let newUser = await User.findById(userId)
        return res.status(200).json({
            code:2,
            user:newUser
        })
    }
    for(let i = 0; i<focusArr.length; i++){
        let {_id:userid} = focusArr[i]
        if(userid.toString() === userId.toString()){
            focusArr.splice(i,1)
            await User.updateOne({_id:userId},{
                $set:{
                    focus:focusArr
                }
            })
            let newUser = await User.findById(userId)
            return res.status(200).json({
                code:3,
                user:newUser
            })
    }}
})

router.post('/api/likeme',auth,async (req,res) => {
    let user = req.user
    // 当前登录用户 ID
    let userId = user._id
    // 要关注的坛主ID
    let id = req.body._id
    let tanzhu = await User.findById(id)
    // console.log(tanzhu)
    
    let likemeArr = tanzhu.likeme
    // console.log(likemeArr[0]._id.toString()===userId.toString())
    let flag = likemeArr.some((item,i) => {
        return item._id.toString() === userId.toString()
    })
    if(!flag){
        let likemeInfo = {
            nickName:user.nickName,
            avatar:user.avatar,
            _id:user._id
        }
        likemeArr.push(likemeInfo)
        await User.updateOne({_id:id},{$set:{
            likeme:likemeArr
        }})
        let newUser = await User.findById(id)
        return res.status(200).json({
            code:2,
            user:newUser,
            msg:'粉丝加一'
        })
    }
    for(let i = 0; i<likemeArr.length; i++){
        let {_id:userid} = likemeArr[i]
        if(userid.toString() === userId.toString()){
            // console.log(userid.toString() === userId.toString())
            likemeArr.splice(i,1)
            await User.updateOne({_id:id},{
                $set:{
                    likeme:likemeArr
                }
            })
            let newUser = await User.findById(id)
            return res.status(200).json({
                code:3,
                user:newUser,
                msg:'粉丝减一'
            })
    }}
})

router.post('/api/liketext',auth,(req,res) => {
    res.status(200).json({
        code:0
    })
})

module.exports = router