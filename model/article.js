// 发表文章数据模型
var mongoose = require('mongoose')
var user = require('./user')
var Schema = mongoose.Schema
var articleSchema = new Schema({
    blogTitle:{
        type:String,
        require:true
    },
    content:{
        type:String,
        required:true
    },
    createTime:{
        type:Date,
        default:Date.now
    },
    userId:String,
    userAva:String,
    userNickname:String,
    like:[],
    comment:[]
})

module.exports = mongoose.model('articel',articleSchema)