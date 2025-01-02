const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models');
const { transporter } = require("../email/sendEmail");



const forgotPassController = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    // Q23 -= ``
    if (!user) {
        return res.status(404).json({ message: 'No user with that email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // const transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: process.env.EMAILUSER,
    //         pass: process.env.EMAILPASS
    //     }
    // });



    const mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Password Reset',
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333333;
                text-align: center;
            }
            p {
                color: #555555;
                line-height: 1.6;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                margin: 20px 0;
                font-size: 16px;
                font-weight: bold;
                color: #ffffff;
                background-color: #007bff;
                text-decoration: none;
                border-radius: 4px;
                text-align: center;
            }
            .footer {
                text-align: center;
                color: #888888;
                font-size: 14px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Password Reset Request</h1>
            <p>You are receiving this email because you (or someone else) requested a password reset for your account.</p>
            <p>To reset your password, please click the button below:</p>
            <a href="http://${req.headers.host}/reset/${token}" class="button">Reset Password</a>
            <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>If you have any questions or need further assistance, please contact our support team.</p>
            <div class="footer">
                <p>Thank you,<br>The Demo Team</p>
            </div>
        </div>
    </body>
    </html>
    `


    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error sending the email' });
        }
        // res.status(200).json({ message: 'An email has been sent to ' + user.email + ' with further instructions.' });
        res.render('forgotPass', { success: 'An email has been sent to ' + user.email + ' with further instructions.' });
    });
}

module.exports = forgotPassController;