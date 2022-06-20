module.exports = (req, res, next) => {
    let error = {}

    if(!req.body.zip){
        error.zip = "zip is required"
    }

    if(!req.body.length){
        error.length = "length is required"
    }

    if(!req.body.width){
        error.width = "width is required"
    }

    if(!req.body.height){
        error.height = "height is required"
    }

    if(!req.body.weight){
        error.weight = "weight is required"
    }

    if(Object.keys(error).length > 0){
        res.status(401).json({
            status: "failed",
            message: "Invalid entry",
            error: error
        })
    }else{
        next()
    }

}