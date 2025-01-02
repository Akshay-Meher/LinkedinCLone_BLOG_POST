const { body, validationResult, check } = require('express-validator');

// Validation middleware
const updatePostValidation = [
    body('title')
        .notEmpty().withMessage('title is required.')
        .trim()
        .isLength({ min: 2 }).withMessage('Title should be at least 2 words.'),
    body('content')
        .notEmpty().withMessage('content is required.')
        .trim()
        .isLength({ min: 1 }).withMessage('content is required.')
    // body('profile_img').custom(async (value, { req }) => {
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
    // check('profile_img')
    //     .custom((value, { req }) => {
    //         if (!req.file) {
    //             throw new Error('Image file is required.');
    //         }
    //         return true;
    //     })


];

const updatePostMidd = async (req, res, next) => {

    const errors = validationResult(req);
    console.log('errorswewe', { errors: errors.mapped() });
    if (!errors.isEmpty()) {

        return res.render('profile', { errors: errors.mapped() });
    }

    next();
};

module.exports = { updatePostValidation, updatePostMidd };
