const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

let Product = require('../models/product')

exports.get_all_products = (req, res, next) => {
    Product.find({})
        .select('_id name quantity price productImage sellerid')
        .populate('sellerid', 'full_name')
        .exec((err, data) => {
            if (!err) {
                if (data.length > 0) {
                    res.status(201).json({
                        status: "success",
                        message: "All products fetched",
                        count: data.length,
                        products: data.map(p => {
                            return {
                                _id: p._id,
                                name: p.name,
                                quantity: p.quantity,
                                proce: p.proce,
                                productImage: p.productImage,
                                seller: p.sellerid
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
                    error: err
                })
            }
        });
}

exports.get_single_product = (req, res, next) => {
    Product.findById(req.params.id)
        .populate('sellerid')
        .exec((err, data) => {
            if (!err) {
                if (data.length < 1) {
                    return res.status(401).json({
                        status: "failed",
                        message: "No product to show"
                    })
                }

                res.status(201).json({
                    status: "success",
                    message: "All sellers orders fetched",
                    product: data
                })
            } else {
                res.status(500).json({
                    status: "failed",
                    error: err
                })
            }
        })
}