
const models = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Validator = require('fastest-validator');
const { sendMail } = require('../email/sendEmail');
const v = new Validator();
require('dotenv').config();

// Validation Schemas
const signUpSchema = {
    name: { type: "string", min: 3, max: 30, trim: true },
    email: { type: "email" },
    password: { type: "string", min: 6, max: 100 }
};

const loginSchema = {
    email: { type: "email" },
    password: { type: "string", min: 6, max: 100 }
};

const validateSignUp = v.compile(signUpSchema);
const validateLogin = v.compile(loginSchema);

// Sign up
async function signUp(req, res) {
    try {
        // // Validate input
        // const validation = validateSignUp(req.body);
        // if (validation !== true) {
        //     return res.status(400).json({ errors: validation });
        // }
        // // Check if the email already exists
        // const existingUser = await models.User.findOne({ where: { email: req.body.email } });
        // if (existingUser) {
        //     return res.status(404).json({
        //         message: "Email already exists!",
        //     });
        //     const error = {
        //         name: "Email already exists!"
        //     }
        //     // return res.status(400).render('register', {
        //     //     error
        //     // });

        // }




        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        // Create the new user
        const user = {
            name: req.body.name,
            email: req.body.email,
            password: hash,
        };

        await models.User.create(user);

        if (process.env.FRONTEND_TYPE == "NODE") {

            sendMail(user.email, 'Welcome to My App!', `Hello ${user.name},\n\nThank you for registering!\n\nBest Regards,\nMy App Team`);

            res.status(201).redirect('/user/login');
        } else {
            res.status(201).json({
                message: "User created successfully",
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!",
        });
    }
}

// Login
async function login(req, res) {

    try {
        // Validate input
        const validation = validateLogin(req.body);
        if (validation !== true) {
            return res.status(400).json({ errors: validation });
        }

        // Find the user by email
        const user = await models.User.findOne({ where: { email: req.body.email } });
        if (!user) {
            // return res.status(401).json({
            //     message: "Invalid credentials!",
            // });
            return res.status(401).render('login', { message: "Invalid credentials!" });
        }

        // Check if the password matches
        // console.log("user passward", user.password);

        if (!user.password) {
            return res.status(401).render('login', { message: "User register by Google, Please login with Google!" });
        }

        const result = await bcryptjs.compare(req.body.password, user.password);
        if (!result) {
            // return res.status(401).json({
            //     message: "Invalid credentials!",
            // });
            return res.status(401).render('login', { message: "Invalid credentials!" })
        }

        // Generate a token
        const token = await new Promise((resolve, reject) => {
            jwt.sign(
                { email: user.email, userId: user.id, name: user.name },
                // "AKSHAY_SECRET_KEY",
                process.env.JWT_KEY,
                (err, token) => {
                    if (err) return reject(err);
                    resolve(token);
                }
            );
        });

        if (token) {
            console.log("token", token);
        }

        // res.status(200).json({
        //     message: "Authentication successful!",
        //     token: token,
        // });

        res.cookie('token', token, {
            httpOnly: false,
        });

        res.status(200).redirect('/post');
        // res.status(200).redirect('/user/sign-up');

        // res.status(200).redirect('/dashboard');


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    }
}

module.exports = {
    signUp,
    login
};
