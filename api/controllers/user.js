const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

let User = require('../models/user')

exports.register = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(422).json({
                    status: 'failed',
                    message: 'User already exist'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            status: 'failed',
                            message: 'could not generate password',
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            account_type: req.body.account_type,
                            full_name: req.body.full_name,
                            country: req.body.country,
                            state: req.body.state,
                            city: req.body.city,
                            address: req.body.address
                        })
                        user.save()
                            .then(result => {
                                console.log(result)
                                res.status(201).json({
                                    status: 'success',
                                    message: 'user created successfully'
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    status: 'failed',
                                    message: 'could not create user',
                                    error: err
                                })
                            })
                    }
                })
            }
        })
}

exports.login = (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(404).json({
                status: 'failed',
                message: 'Login failed'
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (e,r) => {
            if (e) {
                return res.status(401).json({
                    status: "failed",
                    message: "Unauthenticated"
                })
            }

            if (r) {

                const token = jwt.sign(
                    { email: user[0].email, userid: user[0]._id, account_type: user[0].account_type },
                    process.env.JWT_KEY,
                    {expiresIn: '1h'}
                )

                return res.status(200).json({
                    status: "success",
                    message: "user login successful",
                    token: token
                })
            }

            res.status(401).json({
                status: "failed",
                message: "Unauthenticated"
            })
        })
    })
    .catch(err => {
        res.status(500).json({
            status: 'failed',
            message: 'could not create user',
            error: err
        })
    })
}