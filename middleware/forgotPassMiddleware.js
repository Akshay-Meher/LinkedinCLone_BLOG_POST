const { body, validationResult } = require('express-validator');
const { User } = require('../models'); // Adjust the path to your User model

// Custom validator to check if the email already exists
const emailExists = async (email) => {
    const user = await User.findOne({ where: { email } });
    return user !== null;
};

// Validation middleware
const forgotPassValidation = [


    body('email')
        .isEmail().withMessage('Invalid email format.')
        .notEmpty().withMessage('Email is required.')
        .custom(async (email) => {
            if (! await emailExists(email)) {
                throw new Error('Email is not registered.');
            }
        }),
];

const forgotPassMidd = async (req, res, next) => {
    // Validate request
    const errors = validationResult(req);
    // console.log('errorswewe', { errors: errors.mapped() });
    if (!errors.isEmpty()) {
        // console.log('errors', errors.mapped());
        return res.render('forgotPass', { errors: errors.mapped() });
    }

    // Proceed to the next middleware if validation passed
    next();
};

module.exports = { forgotPassValidation, forgotPassMidd };
