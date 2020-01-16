// 文章评论数据模型
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var commentSchema = new Schema({
    masterID:Object,//当前文章主的id
    articleID:Object,
    userID:Object,//评论用户Id
    reply:[],// 文章所属评论子评论
    commentbody:[],//评论主题
})

module.exports = mongoose.model('comments',commentSchema)