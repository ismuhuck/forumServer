// 发表文章数据模型
var mongoose = require('mongoose')
var user = require('./user')
var Schema = mongoose.Schema
var articleSchema = new Schema({
    content:{
        type:String,
        required:true
    },
    userId:String
})

module.exports = mongoose.model('articel',articleSchema)