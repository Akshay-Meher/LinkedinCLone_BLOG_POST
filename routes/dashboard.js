const express = require('express');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get('/', checkAuth.checkAuth, (req, res) => {
    res.render('dashboard');
})



module.exports = router;