module.exports = (req, res, next) => {
    let error = {}
    if(!req.body.tracking_code){
        error.tracking_code = "tracking_code is required"
    }

    if(!req.body.carrier){
        error.carrier = "carrier is required"
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