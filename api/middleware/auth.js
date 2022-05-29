const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.body.user_data = decoded
        next()
    } catch {
        return res.status(401).json({
            status: "failed",
            message: "Unauthenticated"
        })
    }
}