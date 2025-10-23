import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        statusCode: err.statusCode || 500,
        msg: err.message || 'Something went wrong, please try again later'
    };

    if (err.name === 'ValidationError') {
        customError.msg = Object.values(err.errors)
            .map(item => item.message)
            .join(', ');
        customError.statusCode = 400;
    }

    if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
        customError.statusCode = 400;
    }

    if (err.name === 'JsonWebTokenError') {
        customError.msg = 'Invalid token, please log in again';
        customError.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        customError.msg = 'Token expired, please log in again';
        customError.statusCode = 401;
    }

    return res.status(customError.statusCode).json({
        success: false,
        message: customError.msg
    });
};

export default errorHandlerMiddleware;