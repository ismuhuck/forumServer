/**
 * 创建文件夹
 * @param {*} folder 文件夹名
 */
const fs = require('fs')
exports.createFolder = function(folder){
    try{
        fs.accessSync(folder)
    }catch(err){
        fs.mkdirSync(folder)
    }
}

/**
 * 是否存在文件
 * @param {*} fileName 文件名
 */
exports.isPresenceFile = async function(fileName) {
    let flag = false
    try {
        console.log(fileName)
        const rf = await fs.readFileSync(path.join(__dirname,fileName))
        flag = true
        return flag
    } catch (err) {
        flag= false
        return flag
    }
}
