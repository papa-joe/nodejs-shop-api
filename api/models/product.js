const mongoose = require('mongoose');

// product Schema
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    sellerid: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    price: { type: String, required: true },
    productImage: {type: String, required: false},
    sku: { type: String, required: true },
    status: { type: String, required: true }
})

module.exports = mongoose.model('Product', userSchema)