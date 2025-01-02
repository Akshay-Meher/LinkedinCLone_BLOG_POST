const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');



router.get('/:token', async (req, res) => {
    // console.log('req.params.token', req.params);
    const user = await User.findOne({
        where: {
            resetToken: req.params.token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });


    if (!user) {
        // return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        // console.log("Res1");
        return res.render('reset', { message: 'Password reset token is invalid or has expired.' });
    } else {

        // res.render('reset', { token: req.params.token });
    }

    // console.log("Res2");
    return res.render('reset', { token: req.params.token });
});

const resetValidation = [
    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }).withMessage('Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one digit, and one special character.')
        .notEmpty().withMessage('Password is required.'),

    body('confirmPass')
        .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.')
]




router.post('/:token', resetValidation, async (req, res) => {
    const { password } = req.body;
    const user = await User.findOne({
        where: {
            resetToken: req.params.token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // console.log('errors', errors.mapped());
        return res.render('reset', { errors: errors.mapped(), token: req.params.token });
    }

    if (!user) {
        // return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        res.render('reset', { message: 'Password reset token is invalid or has expired.' })
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    // user.password = await bcrypt.hash(password, 10);
    user.password = hash;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    // res.status(200).json({ message: 'Password has been reset successfully.' });
    res.render('reset', { success: 'Password has been reset successfully.' })
});

module.exports = router;
