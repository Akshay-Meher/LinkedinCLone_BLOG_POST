const express = require('express');
const { myNetworkController, findAllReq } = require('../controllers/myNetworkController');
const { checkAuth } = require('../middleware/check-auth');

const router = express.Router();

router.get("/", checkAuth, myNetworkController);
router.get("/get", checkAuth, findAllReq);

module.exports = router;
