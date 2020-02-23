//用户数据模型
var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')


var Schema = mongoose.Schema
var userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    nickName:{
        type:String,
        required:true,
        unique:true //限制昵称不可重复
    },
    password:{
        type:String,
        required:true,
        set(val){
            // 加密密码 
            return bcrypt.hashSync(val,10)
        }
    },
    avatar:{
        type:String,
        default:'http://localhost:5000/imgs/ata.jpg'
    },
    address:{
        type:String
    },
    company:{//所在公司
        type:String
    },
    qq:String,
    qianming:{
        type:String
    },
    sex:String,
    startTime:{
        type:Date,
        default:new Date().getTime()
    },
    likeme:[],// 粉丝
    focus:[],// 关注
    collecting:[],// 收藏文章
    likeArticle:[], // 我赞过的文章
    // 状态码 0：无异常 1：禁言 2：黑名单不能浏览文章 3：账号已被注销  4: 账号审核中 5：注册已拒绝
    statusCode:{
        type:Number,
        default:4
    }
})

module.exports = mongoose.model('User',userSchema)