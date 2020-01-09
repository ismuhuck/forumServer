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
    console.log(focusArr)
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

router.get('/api/likeme',auth,(req,res) => {
    res.status(200).json({
        code:0
    })
})

router.post('/api/liketext',auth,(req,res) => {
    res.status(200).json({
        code:0
    })
})

module.exports = router