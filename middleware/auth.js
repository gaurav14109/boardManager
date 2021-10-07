const jwt = require('jsonwebtoken')
const config = require('config')
module.exports.verifyUser = async (req, res, next) => {

    const token = req.headers['x-auth-token'];
    try {
        const userData = await jwt.verify(token, config.jwtsecret)
        req.user = {
            email: userData.email,
            id: userData.id
        }
        next()
    } catch (err) {
        console.error(err)
        return res.status(401).json({msg: err})
    }

}