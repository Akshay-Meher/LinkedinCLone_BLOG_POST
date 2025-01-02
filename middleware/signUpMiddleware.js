const { body, validationResult } = require('express-validator');
const { User } = require('../models'); // Adjust the path to your User model

// Custom validator to check if the email already exists
const emailExists = async (email) => {
    const user = await User.findOne({ where: { email } });
    return user !== null;
};

// Validation middleware
const signUpValidation = [
    body('name')
        .trim()
        .isAlpha().withMessage('Name should not contain numbers or special characters.')
        .notEmpty().withMessage('Name is required.'),

    body('email')
        .isEmail().withMessage('Invalid email format.')
        .notEmpty().withMessage('Email is required.')
        .custom(async (email) => {
            if (await emailExists(email)) {
                throw new Error('Email is already registered.');
            }
        }),

    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }).withMessage('Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one digit, and one special character.')
        .notEmpty().withMessage('Password is required.'),

    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.')
];

const signUpMidd = async (req, res, next) => {
    // Validate request
    const errors = validationResult(req);
    // console.log('errorswewe', { errors: errors.mapped() });
    if (!errors.isEmpty()) {
        // console.log('errors', errors.mapped());
        return res.render('register', { errors: errors.mapped() });
    }

    // Proceed to the next middleware if validation passed
    next();
};

module.exports = { signUpValidation, signUpMidd };
