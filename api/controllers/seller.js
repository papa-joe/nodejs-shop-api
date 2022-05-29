exports.add_product = (req, res, next) => {
    return res.status(422).json({
        status: 'success',
        message: 'product added'
    })
}