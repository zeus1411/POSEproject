import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
    // Log chi tiết error để debug
    console.error('=== ERROR HANDLER ===');
    console.error('Request URL:', req.method, req.originalUrl);
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Status Code:', err.statusCode);
    console.error('Error Stack:', err.stack);
    
    // Log request body nếu có
    if (req.body && Object.keys(req.body).length > 0) {
        console.error('Request Body:', JSON.stringify(req.body, null, 2));
    }

    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong, please try again later'
    };

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        customError.msg = Object.values(err.errors)
            .map(item => item.message)
            .join(', ');
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // Mongoose Duplicate Key Error
    if (err.code && err.code === 11000) {
        customError.msg = `Trường ${Object.keys(err.keyValue).join(', ')} đã tồn tại, vui lòng chọn giá trị khác`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // Mongoose Cast Error (Invalid ObjectId)
    if (err.name === 'CastError') {
        customError.msg = `ID không hợp lệ: ${err.value}`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        customError.msg = 'Token không hợp lệ, vui lòng đăng nhập lại';
        customError.statusCode = StatusCodes.UNAUTHORIZED;
    }

    if (err.name === 'TokenExpiredError') {
        customError.msg = 'Token đã hết hạn, vui lòng đăng nhập lại';
        customError.statusCode = StatusCodes.UNAUTHORIZED;
    }

    console.error('Response:', customError);
    console.error('===================\n');

    return res.status(customError.statusCode).json({
        success: false,
        message: customError.msg,
        ...(process.env.NODE_ENV === 'development' && { 
            error: err.message,
            stack: err.stack 
        })
    });
};

export default errorHandlerMiddleware;