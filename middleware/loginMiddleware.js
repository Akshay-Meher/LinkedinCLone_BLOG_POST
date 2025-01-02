const { body, validationResult } = require('express-validator');

// Validation middleware
const loginValidation = [
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Invalid email format.'),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage('Password must be at least 8 characters long, contain one uppercase, one lowercase, one digit, and one special character.'),

];

const loginMidd = async (req, res, next) => {
    // Validate request
    const errors = validationResult(req);
    console.log('errorswewe', { errors: errors.mapped() });
    if (!errors.isEmpty()) {
        // console.log('errors', errors.mapped());
        return res.render('login', { errors: errors.mapped() });
    }

    // Proceed to the next middleware if validation passed
    next();
};

module.exports = { loginValidation, loginMidd };
