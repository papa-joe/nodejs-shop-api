const mongoose = require('mongoose')

const Product = require('../models/product')
const Cart = require('../models/cart')

exports.add_product = (req, res) => {

    if (req.body.user_data.account_type === "Seller") {
        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            sellerid: req.body.user_data.userid,
            name: req.body.name,
            quantity: req.body.quantity,
            price: req.body.price,
            productImage: req.file.path,
            sku: req.body.sku,
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

    Product.findById(req.params.id, (err, data) => {
        if (!err) {
            if (data.sellerid == req.body.user_data.userid) {
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

    Product.findById(req.params.id, (err, data) => {
        if (!err) {
            if (data && data.sellerid == req.body.user_data.userid) {
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
        Cart.find({ sellerid: req.params.id })
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

exports.order = (req, res, next) => {
    if (req.body.user_data.account_type === "Seller") {
        Cart.find({ sellerid: req.params.id, status: req.params.q })
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