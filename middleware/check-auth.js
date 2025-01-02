const jwt = require('jsonwebtoken');
require('dotenv').config();

function checkAuth(req, res, next) {
    try {
        let token;
        let user;

        if (process.env.FRONTEND_TYPE == "NODE") {
            token = req.cookies.token;
            user = {
                id: req.user?.dataValues?.id,
                name: req.user?.dataValues?.name,
                email: req.user?.dataValues?.email,
                googleId: req.user?.dataValues?.googleId_
            };
        } else {
            token = req.headers?.authorization?.split(" ")[1];
        }
        // console.log("checkAuth user", user);
        // console.log("checkAuth token", token);
        if (token || user.id) {

            if (user.id) {
                req.userData = user;
            } else {
                const decodedToken = jwt.verify(token, process.env.JWT_KEY);
                // req.userData = decodedToken;
                // console.log('decodedToken', decodedToken);
                req.userData = { id: decodedToken.userId, ...decodedToken }
            }
            next();
        } else {
            if (process.env.FRONTEND_TYPE == "NODE") {
                return res.redirect('/user/login');
            } else {
                return res.redirect('/user/login');
                // return res.status(401).json({
                //     'message': "Invalid or expired token provided!"
                // });
            }

        }
    } catch (e) {

        console.log("checkAuth Error", e);
        return res.redirect('/user/login');

        // return res.status(401).json({
        //     'message': "Invalid or expired token provided!",
        //     'error': e
        // });
    }
}

module.exports = { checkAuth }
// // module.exports = checkAuth;
