module.exports = (req, res, next) => {
    let error = {}
    if(!req.body.card_number){
        error.card_number = "card_number is required"
    }

    if(!req.body.cvv){
        error.cvv = "cvv is required"
    }

    if(!req.body.expiry_month){
        error.expiry_month = "expiry_month is required"
    }

    if(!req.body.expiry_year){
        error.expiry_year = "expiry_year is required"
    }

    if(Object.keys(error).length > 0){
        res.status(401).json({
            status: "failed",
            message: "Unauthenticated",
            error: error
        })
    }else{
        next()
    }

}