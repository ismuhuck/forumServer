//用户上传文件
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var uploadImgSchema = new Schema({
    imgInfo:Object,
    articleID:Object
})

module.exports = mongoose.model('uploadImg',uploadImgSchema)