const express = require('express');
const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { User } = require('../models');
const { forgotPassValidation, forgotPassMidd } = require('../middleware/forgotPassMiddleware');
const forgotPassController = require('../controllers/forgotPassConroller');
const router = express.Router();



router.get("/", (req, res) => {
    res.render('forgotPass');
});

router.post('/', forgotPassValidation, forgotPassMidd, forgotPassController);

module.exports = router;
