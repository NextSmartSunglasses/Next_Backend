class ExpressValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = "ExpressValidationError";
        this.statusCode = 400;
        this.details = details;
    }
}

class ExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = "ExistsError";
        this.statusCode = 400;
    }
}

class InvalidValue extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidValue";
        this.statusCode = 400;
    }
}

class InvalidAction extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidAction";
        this.statusCode = 400;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;
    }
}

class UserNotAuthenticated extends Error {
    constructor(message) {
        super(message);
        this.name = "UserNotAuthenticated";
        this.statusCode = 401;
    }
}

class UserNotAuthorized extends Error {
    constructor(message) {
        super(message);
        this.name = "UserNotAuthorized";
        this.statusCode = 403;
    }
}

class UserExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserExistsError";
        this.statusCode = 409; // Conflict
    }
}

module.exports = {
    ExpressValidationError,
    ExistsError,
    InvalidValue,
    InvalidAction,
    NotFoundError,
    UserNotAuthenticated,
    UserNotAuthorized,
    UserExistsError
};
