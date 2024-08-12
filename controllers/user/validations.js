const { body, validationResult } = require("express-validator");
var E = null;
const db = require("../../models"); // Make sure to import the database models

const PASSWORD_SIZE = 4;

loginvalidator = [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: PASSWORD_SIZE }),
    commonErrorResponse,
];

signupValidator = [
    body("email").isEmail().normalizeEmail().custom(async (email) => {
        const existingUser = await db.User.findOne({ email });
        if (existingUser) {
            throw new Error('Email already in use');
        }
    }),
    body("name").isLength({ min: 3, max: 50 }).trim().escape(),
    body("lastname").isLength({ min: 3, max: 50 }).trim().escape(),
    body("password").isLength({ min: PASSWORD_SIZE }),
    body("tel").not().isEmpty().withMessage("Telephone number is required"),
    commonErrorResponse,
];

forgotValidator = [
    body("email").isEmail().normalizeEmail(),
    commonErrorResponse,
];

function commonErrorResponse(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new E.ExpressValidationError("Invalid input", errors.array()));
    }
    next();
}

module.exports = function (errors) {
    E = errors;
    return {
        loginvalidator: loginvalidator,
        signupValidator: signupValidator,
        forgotValidator: forgotValidator,
    };
};
