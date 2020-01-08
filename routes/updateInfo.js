// 修改用户信息接口
var express = require('express')
var User = require('../model/user')
var auth = require('./auth')
var bcrypt = require('bcryptjs')
var multer = require('multer')
// var upload = multer({ dest: 'uploads/' })
let router = express.Router()

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 接收到文件后输出的保存路径（若不存在则需要创建）
        cb(null, 'uploads/');    
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
        cb(null, Date.now() + "-" + file.originalname);  
    }
});
var upload = multer({ storage: storage})
// 修改用户头像接口
router.post('/api/uploadAva',auth,upload.single('avatar'),async (req,res) =>{
    var file = req.file
    let avaPath = "http://localhost:5000/"+file.filename
    var user = await User.update({_id:req.user._id},{$set:{
        avatar:avaPath
    }})
    res.json({
        code:0,
        msg:'文件上传成功'
    })
})
// code 1:修改失败 0:修改成功 2:邮箱已存在 3：昵称已存在 4:原始密码错误 5：新密码与原始密码相同
// 修改用户信息接口
router.post('/api/info',auth,async (req,res) => {
    var id = req.user._id
    let body = req.body
    var isEmail = await User.findOne({email:body.email})
    var isNickName = await User.findOne({nickName:body.nickName})
    if(isNickName){
        return res.status(200).json({code:3})
    }
    if(isEmail){
        return res.status(200).json({code:2})
    }
    
    var user =await User.update({_id:id},{$set:{
        email:body.email,
        nickName:body.nickName,
        address:body.address,
        company:body.company,
        qq:body.qq,
        qianming:body.qianming
    }})
    if(!user){
        return res.status(200).json({
            code:1
        })
    }
    res.json({
        code:0,
        user:user
    })
})


// 修改密码接口
router.post('/api/updatePass',auth,async (req,res) => {
    let id = req.user._id
    var pass =await User.findOne({_id:id})
    // bcrypt 密码验证
    var flag= bcrypt.compareSync(req.body.password, pass.password)
    var newFlag = bcrypt.compareSync(req.body.newPassword, pass.password)
    if(!flag){
        return res.status(200).json({
             msg:'原始密码错误',
             code:4
        }
        )
    }
    if(newFlag){
        return res.status(200).json({
            msg:"新密码和原始密码相同",
            code:5
        })
    }
    var user = await User.update({_id:id},{$set:{
        password:req.body.newPassword
    }})
    res.json({
        user:user,
        flag:flag,
        code:0
    })
    
})

module.exports = router