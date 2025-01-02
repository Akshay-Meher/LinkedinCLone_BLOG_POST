
const { transporter } = require('../email/sendEmail');
const firebaseNotify = require('../helpers/sendFirebaseNotificatoin');
const { Comment, FirebaseToken, User, Post, Notification } = require('../models');
const admin = require('../helpers/firebase');
const { Json } = require('sequelize/lib/utils');

const commentsController = async (req, res) => {

    // console.log("Comments useraData ", req.userData);
    // console.log("Comments email ", req.params.email);
    // console.log("Comments text", req.body.commentText);

    try {
        const comment = await Comment.create({
            userId: req.userData.id,
            postId: req.params.postId,
            content: req.body.commentText
        });
        if (comment) {

            const post = await Post.findByPk(req.params.postId);
            const userId = JSON.parse(JSON.stringify(post)).userId;
            const receiverId = userId;
            const senderId = req.userData.id;
            const commentId = comment.id;
            // console.log("Commet controller", userId);


            try {

                const notification = await Notification.create({
                    senderId, receiverId,
                    content: req.body.commentText,
                    postId: commentId,
                    type: "comment"
                });
                // console.log('notification', notification);

            } catch (error) {
                console.log(error);
            }

            const user = await User.findByPk(req.userData.id);

            const token = await FirebaseToken.findOne({
                where: { userId: userId }
            });


            if (token) {

                // console.log('token', JSON.parse(JSON.stringify(token))?.token);

                const token1 = JSON.parse(JSON.stringify(token))?.token;

                const message = {
                    notification: {
                        title: `${req.userData.name} commented on your post!`,
                        body: req.body.commentText,
                    },
                    token: token1,
                };

                await admin
                    .messaging()
                    .send(message)
                    .then((response) => {
                        console.log("Notification sent successfully:", response);
                    })
                    .catch((error) => {
                        console.error("Error sending notification:", error);
                        // res.status(500).send("Error sending notification");
                    });

            }
            return res.redirect("/post");

        } else {
            res.redirect("post/add-post");
        }
    } catch (error) {
        console.log("Error", error);

        res.status(404).json({
            error: error
        });
        // res.redirect("post/add-post");
    }

}


module.exports = commentsController;