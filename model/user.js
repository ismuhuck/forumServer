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
    startTime:{
        type:Date,
        default:Date.now
    },
    lastTime:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('User',userSchema)