const express = require('express');
const checkAuth = require('../middleware/check-auth');
const myPostController = require('../controllers/myPostsController');
const router = express.Router();



router.get('/', checkAuth.checkAuth, myPostController);



module.exports = router;