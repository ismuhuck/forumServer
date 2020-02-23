// 发表文章数据模型
var mongoose = require('mongoose')
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
    // 点赞
    like:[],
    // 评论
    comment:[],
    // 0 为没有删除  1 为删除
    isDel:{
        type:String,
        default:"0"
    },
    // 点赞数量，用于排序
    likeNum:Number,
    // 文章状态状态码  0：无异常 1：文章内容违规已暂停展示 3：用户蓄意发表恶意文章用户已被拉黑
    statusCode:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('article',articleSchema)