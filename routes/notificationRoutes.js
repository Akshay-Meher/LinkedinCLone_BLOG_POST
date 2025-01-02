const express = require('express');
const testController = require('../controllers/testController');
const notificationController = require('../controllers/notificationController');
const { checkAuth } = require('../middleware/check-auth');

const router = express.Router();


router.get("/", checkAuth, notificationController.getAllNotification);

router.get("/count", checkAuth, notificationController.notificationCount);

router.get("/close/:notificationId", checkAuth, notificationController.readNotification);

module.exports = router;
