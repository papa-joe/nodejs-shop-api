const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

module.exports = (req, res, next) => {
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_KEY)

            if (decoded.account_type === "Buyer") {
                req.body.user_id = decoded.userid
                next()
            } else {
                return res.status(401).json({
                    status: "failed",
                    message: "Unauthenticated"
                })
            }
        } catch {
            return res.status(401).json({
                status: "failed",
                message: "Unauthenticated"
            })
        }
    } else {
        if (!req.cookies.cart_cookie) {
            let cookie_name = 'cart_cookie'
            let cookie_value = new mongoose.Types.ObjectId()
            res.cookie(cookie_name, cookie_value, {
                maxAge: 500000,
                secure: false,
                httpOnly: true,
                sameSite: 'lax'
            });
            req.body.user_id = cookie_value
        }else{
            req.body.user_id = req.cookies.cart_cookie
        }
        next()
    }

}