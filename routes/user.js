const express = require('express');
const userController = require('../controllers/userController');
const { signUpValidation, signUpMidd } = require('../middleware/signUpMiddleware');
const { loginValidation, loginMidd } = require('../middleware/loginMiddleware');
const passport = require('passport');
const userDetailController = require('../controllers/userDetailController');
const { checkAuth } = require('../middleware/check-auth');
const { sendConnection, acceptConnectionRequest, rejectConnectionRequest } = require('../controllers/connectionController');
const router = express.Router();


router.get('/sign-up', (req, res) => {
    if (req.user || req.cookies.token) {
        res.redirect("/post");
    } else {
        res.render('register', { errors: [] });
    }
});

router.post('/sign-up', signUpValidation, signUpMidd, userController.signUp);



router.get('/login', (req, res) => {
    if (req.user || req.cookies.token) {
        res.redirect("/post");
    } else {
        res.render('login', { errors: [] });
    }
});


router.get('/getProfile/:userId', userDetailController);

router.post('/login', loginValidation, loginMidd, userController.login);

router.post('/connection/send/:userId', checkAuth, sendConnection);
router.patch('/connection/accept/:userId', checkAuth, acceptConnectionRequest);
router.patch('/connection/reject/:userId', checkAuth, rejectConnectionRequest);




// router.post('/login', passport.authenticate('local', { failureRedirect: '/user/login' }), userController.login);
// router.post('/login', passport.authenticate('local', { failureRedirect: '/user/login' }), userController.login);

module.exports = router;


