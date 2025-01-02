const sendFirebaseNotification = require('../helpers/sendFirebaseNotificatoin');
const { Like, Post, User, Notification, FirebaseToken } = require('../models');

const likeController = async (req, res) => {
    try {
        const userId = req.userData.id;
        const postId = req.params.postId;

        // console.log("Like Controller", postId);

        const post = await Post.findByPk(postId);
        let postOwner;
        let postOwnerID;
        let token;

        if (post) {
            postOwnerID = post.userId;
            postOwner = await User.findByPk(postOwnerID);
        }

        if (postOwnerID) {
            const getToken = await FirebaseToken.findOne({
                where: {
                    userId: postOwnerID
                }
            });

            if (getToken) {
                token = getToken.token;
                // console.log('getToken', token);
            }
        }
        // console.log('postOwner', postOwner.name);

        const existingLike = await Like.findOne({ where: { userId, postId } });

        if (existingLike) {
            await existingLike.destroy();
            // return res.status(200).json({ message: 'Like removed' });
        } else {
            const likeResult = await Like.create({ userId, postId });

            await Notification.create({
                senderId: userId,
                receiverId: postOwnerID,
                postId: postId,
                content: ``,
                type: "like"
            });

            let title = `${req.userData.name} liked you post`;
            let body = "";
            if (userId != postOwnerID) {
                await sendFirebaseNotification(title, body, token);
            }
        }

        res.redirect('/post');
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
};

module.exports = likeController;
