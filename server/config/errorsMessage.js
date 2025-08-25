class CustomAPIError extends Error {
    constructor(message) {
        super(message);
    }
}

class BadRequestError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}

class UnauthenticatedError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = 401;
    }
}

class UnauthorizedError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = 403;
    }
}

class NotFoundError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = 404;
    }
}

export {
    CustomAPIError,
    BadRequestError,
    UnauthenticatedError,
    UnauthorizedError,
    NotFoundError,
};