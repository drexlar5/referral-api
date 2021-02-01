
module.exports = (Schema) => {
    return (req, _res, next) => {
        // validation
        try {
            const options = { abortEarly: false };
            const { error } = Schema.validate(req.body, options);
            if (!error) return next();
            let err = new Error('Validation Error.');
            err.data = error.details?.map(errorObject => errorObject.message)
            err.statusCode = 422;
            next(err);
        } catch (error) {
            next(error);
        }
    }
}