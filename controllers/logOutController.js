const { FirebaseToken } = require('../models');

const logOut = async (req, res) => {

    // console.log("Log-out req.userData", req.userData);
    // console.log("req", req);

    if (req.user) {

        const removeToken = await FirebaseToken.destroy({
            where: { userId: req.user.id }
        });

        console.log(removeToken);

        req.logout(function (err) {
            if (err) {
                console.log("Log-out Error", err);
                return res.send(err); // If there's an error, pass it to the next middleware
            }

            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).send('Error while logging out');
                }
                res.clearCookie('session_user'); // Clear the session cookie
                res.redirect('user/login'); // Redirect to the login page
            });

            // res.redirect('user/login'); // Redirect to login page after successful logout
        });
    } else {

        const removeToken = await FirebaseToken.destroy({
            where: { userId: req.userData.id }
        });
        res.clearCookie('token', { httpOnly: true });
        res.status(200).redirect('user/login');
    }


}

module.exports = logOut;