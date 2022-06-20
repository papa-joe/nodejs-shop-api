const mongoose = require('mongoose');

// product Schema
const OrderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    buyerid: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    orderid: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    zip: { type: String, required: true },
    status: { type: String, required: true }
})

module.exports = mongoose.model('Order', OrderSchema)