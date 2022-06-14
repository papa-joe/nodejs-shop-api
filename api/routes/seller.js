const express = require('express')
const router = express.Router();
const checkAuth = require('../middleware/auth')
const multer = require('multer')

const upload_rules = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './product_images/')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname)
    }
})

const image_filter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({
    storage: upload_rules,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    image_filter: image_filter
})

const SellerController = require('../controllers/seller')

router.post('/add-product', checkAuth, upload.single('productImage'), SellerController.add_product)

router.patch('/edit-product/:id', checkAuth, upload.single('productImage'), SellerController.edit_product)

router.delete('/delete-product/:id', checkAuth, SellerController.delete_product)

router.get('/orders/:id', checkAuth, SellerController.orders)

router.get('/orders/:id/:q', checkAuth, SellerController.order)

module.exports = router