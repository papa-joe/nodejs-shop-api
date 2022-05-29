const express = require('express')
const router = express.Router();
const checkAuth = require('../middleware/auth')

const SellerController = require('../controllers/seller')

router.post('/add-product', checkAuth, SellerController.add_product)

module.exports = router