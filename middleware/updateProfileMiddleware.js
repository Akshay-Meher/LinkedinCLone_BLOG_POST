const { body, validationResult, check } = require('express-validator');
const { User } = require('../models');
const { Op, where } = require('sequelize');

// Validation middleware
const updateValidation = [
    body('name')
        .notEmpty().withMessage('Name is required.')
        .trim()
        .isLength({ min: 1 }).withMessage("Name is required."),
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Invalid email format.')
        .custom(async (value, { req }) => {
            console.log("Validation", req.userData.id);

            const ifExist = await User.findOne({
                where: {
                    email: value,
                    id: {
                        [Op.ne]: req.userData.id
                    }
                }
            });

            console.log('ifExist', ifExist);
            if (ifExist) {
                throw new Error("Email allready Exist!");
            }
        }),
    body('profile_img').custom(async (value, { req }) => {
        if (req.file) {
            // throw new Error("Please upload image!");
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(req?.file?.mimetype)) {
                throw new Error('Only JPEG, PNG, and GIF files are allowed!');
            }

            if (req?.file?.size > 1024 * 1024 * 5) {
                throw new Error('File size must be less than 5MB!');
            }
        }

        return true;
    }),

];

const updateMidd = async (req, res, next) => {

    const errors = validationResult(req);
    console.log('errorswewe', { errors: errors.mapped() });
    if (!errors.isEmpty()) {

        return res.render('profile', { errors: errors.mapped() });
    }

    next();
};

module.exports = { updateValidation, updateMidd };
