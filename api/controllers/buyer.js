const mongoose = require('mongoose')
const Flutterwave = require('flutterwave-node-v3');

let Cart = require('../models/cart')
let Product = require('../models/product')
let Order = require('../models/order')
let User = require('../models/user')

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
                            message: "No products to show"
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
                            message: 'Max quantity passed'
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
                            sellerid: data[0].sellerid,
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
                    res.status(401).json({
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

exports.payment = async (req, res, next) => {
    if (req.body.user_data.account_type === "Buyer") {
        Cart.find({ buyerid: req.body.user_data.userid, status: 'Pending' })
            .select('_id quantity productId')
            .populate('productId', 'price name sellerid')
            .exec()
            .then(item => {
                if (item.length >= 1) {
                    Order.find({ buyerid: req.body.user_data.userid, status: 'Pending' }, (err, data) => {
                        if (!err) {
                            if (data.length <= 0) {
                                res.status(401).json({
                                    status: "failed",
                                    message: 'No order found'
                                })
                            } else {
                                let oredrid = new Date().getTime()
                                up = {
                                    orderid: oredrid
                                }

                                let total = 0
                                item.map(t => {
                                    let p = t.quantity * t.productId.price
                                    total = p += total
                                })

                                Order.updateMany({ buyerid: req.body.user_data.userid, status: 'Pending' }, up, (err, data) => {
                                    if (!err) {
                                        Cart.updateMany({ buyerid: req.body.user_data.userid, status: 'Pending' }, up, (err, data) => {
                                            if (!err) {
                                                rave_payment(req, res, next, total, item)
                                            } else {
                                                res.status(500).json({
                                                    status: "failed",
                                                    message: 'Something went wrong',
                                                    error: err
                                                })
                                            }
                                        })
                                    } else {
                                        res.status(500).json({
                                            status: "failed",
                                            message: 'Something went wrong',
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
                    res.status(401).json({
                        status: "failed",
                        message: 'Cart is empty'
                    })
                }

            })
    }

}

async function rave_payment(req, res, next, total, item){
    const flw = new Flutterwave("FLWPUBK_TEST-f11545a99d1c7e510c869440da712bdf-X", "FLWSECK_TEST-b50e24d348a32cfc55d23549d610cfa5-X");
    const payload = {
        "card_number": req.body.card_number,
        "cvv": req.body.cvv,
        "expiry_month": req.body.expiry_month,
        "expiry_year": req.body.expiry_year,
        "currency": "NGN",
        "amount": total.toString(),
        "redirect_url": "https://www.google.com",
        "fullname": "Olufemi Obafunmiso",
        "email": "oviecovie@gmail.com",
        "phone_number": "07069102741",
        "enckey": "FLWSECK_TESTfe3bf0289cc2",
        "tx_ref": "SH-" + new Date().getTime()
    }

    try {
        const response = await flw.Charge.card(payload)

        if (response.meta.authorization.mode === 'pin') {
            let payload2 = payload
            payload2.authorization = {
                "mode": "pin",
                "fields": [
                    "pin"
                ],
                "pin": 3310
            }
            const reCallCharge = await flw.Charge.card(payload2)

            const callValidate = await flw.Charge.validate({
                "otp": "12345",
                "flw_ref": reCallCharge.data.flw_ref
            })

            if (callValidate.status == "success") {
                give_value(req, res, next, callValidate, item)
            } else {
                res.status(401).json({
                    status: "failed",
                    message: 'Unauthorised'
                })
            }
        } else {
            res.status(401).json({
                status: "failed",
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: 'Unauthorised'
        })
    }

}

async function give_value(req, res, next, callValidate, item) {
    const session = await mongoose.startSession();
    try {

        session.startTransaction();

        Order.updateMany({ buyerid: req.body.user_data.userid, status: 'Pending' }, {status: 'Paid'}, (err, data) => {})

        item.map(t => {
            Cart.findByIdAndUpdate( t._id, {price: t.productId.price, status: 'Paid'}, (err, data) => {})

            Product.findById(t.productId._id, (err, data) => {
                Product.findByIdAndUpdate( t.productId._id, {quantity: data.quantity - t.quantity}, (err, data) => {})
            })

            User.findById(t.productId.sellerid, (err, data) => {
                User.findByIdAndUpdate( t.productId.sellerid, {balance: data.balance + (t.productId.price * t.quantity)}, (err, data) => {})
            })
        })
        
        await session.commitTransaction();

        console.log('success');

        res.status(200).json({
            status: "success",
            message: 'payment successful',
            payment_details: callValidate
        })

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({
            status: "failed",
            message: 'Unauthorised',
            error: error
        })
    }
    session.endSession();

}