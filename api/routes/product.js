const express = require('express')
const router = express.Router();

const ProductController = require('../controllers/product')

router.get('/', ProductController.get_all_products)

router.get('/:id', ProductController.get_single_product)

module.exports = router