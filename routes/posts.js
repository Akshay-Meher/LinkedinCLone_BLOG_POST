const express = require('express');
const { save, show, index, update, destroy, getUpdate, saveMultiple } = require('../controllers/postController');
const checkAuthMiddleware = require('../middleware/check-auth');
const checkAuth = require('../middleware/check-auth');
const imageUploader = require('../helpers/image-uploader');
const { postValidationRules, postMidd } = require('../middleware/postValidation');
const commentsController = require('../controllers/commentsController');
const { updatePostValidation } = require('../middleware/updatePostMiddleware');
const likeController = require('../controllers/likeController');

const router = express.Router();

router.get('/add-post', checkAuth.checkAuth, (req, res) => {
    // res.render('add-post');
    res.render('add-post-multiple');
});

// router.post('/', checkAuthMiddleware.checkAuth, postValidationRules, postMidd, imageUploader.upload.single('image'), save);

router.post('/', checkAuthMiddleware.checkAuth, imageUploader.upload.array('image'), postValidationRules, postMidd, saveMultiple);


// router.post('/', checkAuthMiddleware.checkAuth, imageUploader.upload.single('image'), postValidationRules, postMidd, save);

router.post('/comments/:postId/:email', checkAuthMiddleware.checkAuth, commentsController);


// router.post('/', save);
router.get('/', checkAuthMiddleware.checkAuth, index);


router.get('/update/:postId', checkAuthMiddleware.checkAuth, getUpdate);

router.patch('/update/:postId', checkAuthMiddleware.checkAuth, updatePostValidation, update);



router.delete('/:id?', checkAuthMiddleware.checkAuth, destroy);

router.get('/:id?', show);


//* post likes routes

router.post('/like/:postId', checkAuth.checkAuth, likeController);

module.exports = router;
