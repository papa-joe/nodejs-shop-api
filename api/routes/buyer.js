const express = require('express')
const router = express.Router();
const cartAuth = require('../middleware/cart_auth')
const checkAuth = require('../middleware/auth')
const paymentAuth = require('../middleware/paymentAuth')

const BuyerController = require('../controllers/buyer')

router.post('/cart', cartAuth, BuyerController.add_to_cart)

router.get('/cart', cartAuth, BuyerController.get_cart_items)

router.delete('/cart/:id', cartAuth, BuyerController.remove_from_cart)

router.post('/checkout', checkAuth, BuyerController.checkout)

router.post('/payment', checkAuth, paymentAuth, BuyerController.payment)

module.exports = router