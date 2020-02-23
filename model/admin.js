var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')

var Schema = mongoose.Schema 
var adminSchema = new Schema({
    userName:{
        type:String
    },
    password:{
        type:String,
        set(val){
            // 加密密码 
            return bcrypt.hashSync(val,10)
        }
    },
    createTime:{
        type: Number,
        default:new Date().getTime()
    },
    statusCode:{
        type:Number,
        default:0
    }
})
module.exports = mongoose.model('Admin',adminSchema)