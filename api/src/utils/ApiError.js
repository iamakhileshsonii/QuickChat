class ApiError extends Error{

    //Contructor
    constructor(statusCode, message = "Something went wrong", error=[], stack="") {
        super(message)
        this.statusCode = statusCode,
            this.data = null
        this.stack = stack,
            this.error = error
        
        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }

}

export {ApiError}





