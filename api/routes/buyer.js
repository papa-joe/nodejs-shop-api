const express = require('express')
const router = express.Router();
const cartAuth = require('../middleware/cart_auth')
const checkAuth = require('../middleware/auth')

const BuyerController = require('../controllers/buyer')

router.post('/', cartAuth, BuyerController.add_to_cart)

router.post('/cart', cartAuth, BuyerController.get_cart_items)

router.delete('/remove-from-cart/:id', cartAuth, BuyerController.remove_from_cart)

router.post('/checkout', checkAuth, BuyerController.checkout)

module.exports = router