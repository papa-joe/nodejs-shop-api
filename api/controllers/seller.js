const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

let Product = require('../models/product')

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

exports.edit_product = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)

    Product.findById(req.params.id, (err, data) => {
        if (!err) {
            if (data.sellerid == decoded.userid) {
                if(req.file){
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

exports.delete_product = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)

    Product.findById(req.params.id, (err, data) => {
        if (!err) {
            if (data && data.sellerid == decoded.userid) {
                Product.findByIdAndRemove(req.params.id, (err, data) => {
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