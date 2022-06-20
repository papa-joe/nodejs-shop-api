const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const EasyPost = require('@easypost/api');

const Product = require('../models/product')
const Order = require('../models/order')
const User = require('../models/user')
const Cart = require('../models/cart')

exports.add_product = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)

    if (decoded.account_type === "Seller") {
        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            sellerid: decoded.userid,
            name: req.body.name,
            quantity: req.body.quantity,
            price: req.body.price,
            productImage: req.file.path,
            sku: req.body.sku,
            intShip: req.body.intShip,
            localShip: req.body.localShip,
            status: req.body.status
        })

        product.save((err, data) => {
            if (!err) {
                res.status(201).json({
                    status: "success",
                    message: 'Product added successfully',
                    product: data
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
        res.status(201).json({
            status: "failed",
            message: 'Create a seller account to start adding products'
        })
    }
}

exports.edit_product = (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)

    Product.findById(req.params.id, (err, data) => {
        if (!err) {
            if (data.sellerid == decoded.userid) {
                if (req.file) {
                    req.body['productImage'] = req.file.path
                }
                Product.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, data) => {
                    if (!err) {
                        if (data !== null) {
                            res.status(200).json({
                                status: "success",
                                message: 'Product Updated Successfully',
                                product: data
                            })
                        } else {
                            res.status(404).json({
                                status: "failed",
                                message: 'Product not found'
                            })
                        }

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
                    message: 'Unauthorized'
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

exports.delete_product = (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)

    Product.findById(req.params.id, (err, data) => {
        if (!err) {
            if (data && data.sellerid == decoded.userid) {
                Product.findByIdAndRemove(req.params.id, (err) => {
                    if (!err) {
                        res.status(200).json({
                            status: "success",
                            message: 'product deleted'
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

exports.orders = (req, res, next) => {
    if (req.body.user_data.account_type === "Seller") {
        Cart.find({ sellerid: req.body.user_data.userid })
            .select('_id buyerid orderid productId quantity price localShip status')
            .exec((err, data) => {
                if (!err) {
                    if (data.length > 0) {
                        res.status(201).json({
                            status: "success",
                            message: "All orders fetched",
                            count: data.length,
                            products: data.map(i => {
                                return {
                                    _id: i._id,
                                    buyer: i.buyerid,
                                    orderid: i.orderid,
                                    quantity: i.quantity,
                                    price: i.price,
                                    status: i.status
                                }
                            })
                        })
                    } else {
                        res.status(201).json({
                            status: "success",
                            message: 'There are no orders in the database'
                        })
                    }
                } else {
                    res.status(500).json({
                        status: "failed",
                        message: "Something went wrong",
                        error: err
                    })
                }
            });
    } else {
        res.status(500).json({
            status: "failed",
            message: 'Unauthorized'
        })
    }
}

exports.order = (req, res, next) => {
    if (req.body.user_data.account_type === "Seller") {
        Cart.find({ sellerid: req.body.user_data.userid, status: req.params.q })
            .select('_id buyerid orderid productId quantity price status')
            .exec((err, data) => {
                if (!err) {
                    if (data.length > 0) {
                        res.status(201).json({
                            status: "success",
                            message: "All orders fetched",
                            count: data.length,
                            products: data.map(i => {
                                return {
                                    _id: i._id,
                                    buyer: i.buyerid,
                                    orderid: i.orderid,
                                    quantity: i.quantity,
                                    price: i.price,
                                    status: i.status
                                }
                            })
                        })
                    } else {
                        res.status(201).json({
                            status: "success",
                            message: 'There are no orders in the database'
                        })
                    }
                } else {
                    res.status(500).json({
                        status: "failed",
                        message: "Something went wrong",
                        error: err
                    })
                }
            });
    } else {
        res.status(500).json({
            status: "failed",
            message: 'Unauthorized'
        })
    }
}

exports.ship = async (req, res, next) => {
    Order.find({ orderid: req.params.id, status: 'Paid' }, (err, data) => {
        if (!err) {
            if (data.length > 0) {

                let buyer_details
                let seller_details

                User.findById(data[0].buyerid, (err, buyer) => {
                    if (err) {
                        return res.status(500).json({
                            status: 'failed',
                            message: 'something went wrong',
                            error: err
                        })
                    } else {
                        User.findById(req.body.user_data.userid, (err, seller) => {
                            if (err) {
                                return res.status(500).json({
                                    status: 'failed',
                                    message: 'something went wrong',
                                    error: err
                                })
                            } else {

                                buyer_details = buyer
                                seller_details = seller
                                generate_label(req, res, next, data, buyer_details, seller_details)
                            }
                        })
                    }
                })
            } else {
                res.status(401).json({
                    status: 'alert',
                    message: 'empty response'
                })
            }

        } else {
            res.status(500).json({
                status: 'failed',
                message: 'something went wrong',
                erroe: err
            })
        }
    })
}

async function generate_label(req, res, next, data, buyer_details, seller_details) {
    const api = new EasyPost(process.env.EASYPOST_API_KEY);

    const shipment = new api.Shipment({
        from_address: {
            street1: seller_details.full_name,
            street2: seller_details.address,
            city: seller_details.city,
            state: seller_details.state,
            zip: req.body.zip,
            country: seller_details.country,
            company: 'EasyPost',
            phone: seller_details.phone,
        },
        to_address: {
            name: buyer_details.full_name,
            street1: data[0].address.toString(),
            city: buyer_details.city,
            state: buyer_details.state,
            zip: data[0].zip,
            country: buyer_details.country,
            phone: buyer_details.phone,
        },
        parcel: {
            length: req.body.length,
            width: req.body.width,
            height: req.body.height,
            weight: req.body.weight,
        },
    });

    try {
        const t = await shipment.save()
        const r = await t.buy(shipment.lowestRate())

        if (r.tracking_code) {
            Cart.updateMany({ orderid: req.params.id, status: 'Paid', sellerid: req.body.user_data.userid }, { status: 'Shipped', trackingid: r.tracking_code }, (err, data) => {
                if (!err) {
                    res.status(201).json({
                        status: "success",
                        message: 'label generated',
                        trackingCode: r.tracking_code,
                        data: r
                    })
                } else {
                    res.status(500).json({
                        status: "failed",
                        message: 'something went wrong',
                        error: err
                    })
                }
            })
        } else {
            res.status(500).json({
                status: "failed",
                message: 'something went wrong'
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "failled",
            message: 'something went wrong',
            error: error
        })
    }
}

exports.track = async (req, res, next) => {
    const api = new EasyPost(process.env.EASYPOST_API_KEY)

    const tracker = new api.Tracker({
        tracking_code: req.body.tracking_code,
        carrier: req.body.carrier
    })

    try {
        const t = await tracker.save()

        // here is where you want to update the item in the cart to the tracking status

        res.status(201).json({
            status: "success",
            message: 'tracking successful',
            data: t
        })
    } catch (error) {
        res.status(500).json({
            status: "failled",
            message: 'something went wrong',
            error: error
        })
    }

    
}