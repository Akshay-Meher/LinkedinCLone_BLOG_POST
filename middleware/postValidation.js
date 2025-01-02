const { body, validationResult, check } = require('express-validator');

// Validation and sanitization rules
const postValidationRules = [
    body('title')
        .notEmpty().withMessage('Title is required.')
        .trim()
        .isLength({ min: 2 }).withMessage('Title should be at least 2 words.'),
    body('content')
        .notEmpty().withMessage('Content is required.')
        .trim()
        .isLength({ min: 5 }).withMessage('Content should be at least 5 words.'),

    body('image').custom((value, { req }) => {
        if (!req.files) {
            throw new Error('No files were uploaded.');
        }
        if (req.files.length === 0) {
            throw new Error('At least one file must be uploaded.');
        }
        if (req.files.length > 5) {
            throw new Error('A maximum of 5 files can be uploaded.');
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        req.files.forEach(file => {
            // Check for valid file types
            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error('Only JPEG, PNG, and GIF files are allowed.');
            }

            // Check for file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('File size must not exceed 2MB.');
            }
        });

        return true;
    }),


    // body('image').custom(async (value, { req }) => {
    //     if (!req.file) {
    //         throw new Error("Please upload image!");
    //     }
    //     const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    //     if (!allowedTypes.includes(req.file.mimetype)) {
    //         throw new Error('Only JPEG, PNG, and GIF files are allowed!');
    //     }

    //     if (req.file.size > 1024 * 1024 * 5) {
    //         throw new Error('File size must be less than 5MB!');
    //     }

    //     return true;
    // }),
];


const postMidd = async (req, res, next) => {
    // Validate request
    const errors = validationResult(req);
    console.log('errorswewe', { errors: errors.mapped() });

    if (!errors.isEmpty()) {
        // console.log('errors', errors.mapped());
        // return res.render('login', { errors: errors.mapped() });
        console.log('errors.mapped()', errors.mapped());
        return res.render('add-post-multiple', { errors: errors.mapped() });

    }

    // Proceed to the next middleware if validation passed
    next();
};

module.exports = { postValidationRules, postMidd };
