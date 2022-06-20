const mongoose = require('mongoose');

// product Schema
const cartSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    buyerid: {type: mongoose.Schema.Types.ObjectId, required: true},
    orderid: {type: String, ref: 'Order', required: false},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    sellerid: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    quantity: { type: String, required: true },
    price: { type: String, required: true },
    localShip: { type: String, required: false },
    intShip: { type: String, required: false },
    trackingid: { type: String, required: false },
    carrier: { type: String, required: false },
    status: { type: String, required: true }
})

module.exports = mongoose.model('Cart', cartSchema)