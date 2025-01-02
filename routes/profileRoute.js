const express = require('express');
const checkAuth = require('../middleware/check-auth');
const updateprofileController = require('../controllers/updateProfileController');
const router = express.Router();
const imageUploader = require('../helpers/image-uploader');
const getProfileController = require('../controllers/getProfileController');
const { updateValidation, updateMidd } = require('../middleware/updateProfileMiddleware');
const experienceController = require('../controllers/ExperienceController');

router.get('/', checkAuth.checkAuth, getProfileController);

router.post('/updateprofile', checkAuth.checkAuth, imageUploader.upload.single('profile_img'), updateValidation, updateprofileController);

router.post('/add-experience/:userId', checkAuth.checkAuth, experienceController);



module.exports = router;