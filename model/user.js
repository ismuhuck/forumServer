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
        default:Date.now
    },
    likeme:[],
    // 数组中包含对象 对象内容为 关注人昵称 头像 id
    focus:[],
    collecting:[],//收藏文章
    lastTime:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('User',userSchema)