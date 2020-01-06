var User = require('../model/user')
var jwt = require('jsonwebtoken')
const SECRET = 'password'
const auth = async(req,res,next) => {
    //配置验证中间件
    try {
    const raw = String(req.headers.authorization).split(" ").pop()
    const tokenData = jwt.verify(raw,SECRET)//验证token
    const {id} = tokenData
    req.user = await User.findById(id)
    } catch (e) {
        return res.status(500).send({
            type: 'tokenErr',
            message: 'token异常'
        })
    }
    next() //此中间件执行完成之后，继续执行后面的中间件 
}
module.exports = auth