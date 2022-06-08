const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

let Cart = require('../models/cart')
let Product = require('../models/product')
let Order = require('../models/order')

exports.add_to_cart = (req, res, next) => {
    Cart.find({ buyerid: req.body.user_id, productId: req.body.productId, status: 'Pending' })
        .exec()
        .then(item => {
            Product.find({ _id: req.body.productId }, (err, data) => {
                if (!err) {

                    let q
                    let s
                    let pr

                    if (data.length < 1) {
                        return res.status(401).json({
                            status: "failed",
                            message: "No products to showrer"
                        })
                    }

                    data.map(p => {
                        q = p.quantity
                        s = p.status
                        pr = p.price
                    })

                    if (q < req.body.quantity) {
                        return res.status(422).json({
                            status: 'failed',
                            message: 'Quantity over pass'
                        })
                    }

                    if (s != 'Publish') {
                        return res.status(422).json({
                            status: 'failed',
                            message: 'Product not found'
                        })
                    }

                    if (item.length >= 1) {
                        return res.status(201).json({
                            status: 'success',
                            message: 'Item already in cart'
                        })
                    } else {
                        const cartItem = new Cart({
                            _id: new mongoose.Types.ObjectId(),
                            buyerid: req.body.user_id,
                            orderid: '',
                            productId: req.body.productId,
                            quantity: req.body.quantity,
                            price: pr,
                            status: 'Pending'
                        })

                        cartItem.save((err, data) => {
                            if (!err) {
                                res.status(201).json({
                                    status: "success",
                                    message: 'Item added successfully',
                                    item: data
                                })
                            } else {
                                res.status(500).json({
                                    status: "failed",
                                    message: "Something went wrong",
                                    error: err
                                })
                            }
                        })
                    }
                } else {
                    return res.status(500).json({
                        status: "failed",
                        message: "Something went wrong",
                        error: err
                    })
                }
            })
        })
}

exports.remove_from_cart = (req, res, next) => {

    Cart.findById(req.params.id, (err, data) => {
        if (!err) {
            if (data && data.buyerid == req.body.user_id) {
                Cart.findByIdAndRemove(req.params.id, (err, data) => {
                    if (!err) {
                        res.status(200).json({
                            status: "success",
                            message: 'Item deleted'
                        })
                    } else {
                        res.status(500).json({
                            status: "failed",
                            error: err
                        })
                    }
                });
            } else {
                res.status(404).json({
                    status: "failed",
                    message: 'No product was found'
                })
            }
        } else {
            res.status(500).json({
                status: "failed",
                error: err
            })
        }
    })
}

exports.get_cart_items = (req, res, next) => {
    Cart.find({ buyerid: req.body.user_id, status: 'Pending' })
        .select('_id quantity productId')
        .populate('productId', 'price')
        .exec((err, data) => {
            if (!err) {
                if (data.length > 0) {

                    let total = 0
                    data.map(t => {
                        total = t.productId.price += total
                    })

                    res.status(201).json({
                        status: "success",
                        message: "All items fetched",
                        count: data.length,
                        total: total,
                        items: data.map(p => {
                            return {
                                _id: p._id,
                                quantity: p.quantity,
                                product: p.productId
                            }
                        })
                    })
                } else {
                    res.status(401).json({
                        status: "failed",
                        message: 'Cart is empty'
                    })
                }
            } else {
                res.status(500).json({
                    status: "failed",
                    message: 'Something went wrong',
                    error: err
                })
            }
        });
}

exports.checkout = (req, res, next) => {
    if (req.body.user_data.account_type === "Buyer") {
        Cart.find({ buyerid: req.body.user_data.userid, status: 'Pending' })
            .exec()
            .then(item => {
                let oredrid = new Date().getTime()
                up = {
                    orderid: oredrid
                }

                if (item.length >= 1) {
                    Order.find({ buyerid: req.body.user_data.userid, status: 'Pending' }, (err, data) => {
                        if (!err) {
                            if (data.length <= 0) {
                                const order = new Order({
                                    _id: new mongoose.Types.ObjectId(),
                                    buyerid: req.body.user_data.userid,
                                    orderid: up.orderid,
                                    country: req.body.country,
                                    state: req.body.state,
                                    city: req.body.city,
                                    address: req.body.address,
                                    status: 'Pending'
                                })

                                order.save((err, data) => {
                                    if (!err) {
                                        Cart.updateMany({ buyerid: req.body.user_data.userid, status: 'Pending' }, up, (err, data) => {
                                            if (!err) {
                                                res.status(201).json({
                                                    status: "success",
                                                    message: "Checkout successful",
                                                    error: err
                                                })
                                            } else {
                                                res.status(500).json({
                                                    status: "failed",
                                                    message: "Something went wrong",
                                                    error: err
                                                })
                                            }
                                        })
                                    } else {
                                        res.status(500).json({
                                            status: "failed",
                                            message: "Something went wrong",
                                            error: err
                                        })
                                    }
                                })
                            } else {
                                Order.updateMany({ buyerid: req.body.user_data.userid, status: 'Pending' }, up, (err, data) => {
                                    if (!err) {
                                        Cart.updateMany({ buyerid: req.body.user_data.userid, status: 'Pending' }, up, (err, data) => {
                                            if (!err) {
                                                res.status(201).json({
                                                    status: "success",
                                                    message: "Checkout successful",
                                                    error: err
                                                })
                                            } else {
                                                res.status(500).json({
                                                    status: "failed",
                                                    message: "Something went wrong",
                                                    error: err
                                                })
                                            }
                                        })
                                    } else {
                                        res.status(500).json({
                                            status: "failed",
                                            message: "Something went wrong",
                                            error: err
                                        })
                                    }
                                })
                            }
                        } else {
                            res.status(500).json({
                                status: "failed",
                                message: 'Something went wrong',
                                error: err
                            })
                        }
                    })
                } else {
                    res.status(201).json({
                        status: "failed",
                        message: 'Cart is empty',
                        error: err
                    })
                }
            })
    } else {
        res.status(201).json({
            status: "failed",
            message: 'Unauthenticated'
        })
    }

}