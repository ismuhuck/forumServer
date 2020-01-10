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
        type:String
    },
    userId:Object,
    userAva:String,
    userNickname:String,
    like:[],
    comment:[],
    // 0 为没有删除  1 为删除
    isDel:{
        type:String,
        default:"0"
    }
})

module.exports = mongoose.model('articel',articleSchema)