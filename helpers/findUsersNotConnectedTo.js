const { User, Connection, Sequelize, FirebaseToken, Notification } = require('../models'); // Adjust the path as needed
const sendFirebaseNotification = require('./sendFirebaseNotificatoin');
const { Op } = Sequelize; // Ensure you are importing Op for Sequelize operators


async function findUsersNotConnectedTo(userId) {
    try {
        // Fetch all user IDs that are connected to the specified userId
        const connectedUserIds = await Connection.findAll({
            // attributes: ['userId'],
            attributes: ['connectedUserId'],
            where: {
                userId: userId,
                status: 1 // Only consider connected users
            },
            raw: true
        });

        // const connectedUserIdList = connectedUserIds.map(conn => conn.userId);
        const connectedUserIdList = connectedUserIds.map(conn => conn.connectedUserId);
        connectedUserIdList.push(userId);

        const users = await User.findAll({
            where: {
                id: {
                    [Op.notIn]: connectedUserIdList
                }
            },
            attributes: ['id', 'name', 'email', 'profileImage'],
        });

        // console.log("findUsersNotConnectedTo", JSON.parse(JSON.stringify(users)));

        const UsersNotConnectedTo = JSON.parse(JSON.stringify(users));

        return UsersNotConnectedTo;

    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// Usage
// const result =  findUsersNotConnectedTo(5);


const sendPostNotificationToAllConnections = async (userId, name, postTitle, postId) => {
    try {

        const connections = await Connection.findAll({
            where: {
                userId: userId
            }
        });

        const connectedUserIds = connections.map(conn => conn.connectedUserId);

        connectedUserIds.forEach(async (id) => {
            const test = await FirebaseToken.findOne({
                where: { userId: id }
            });



            // console.log('fireabseToken', test);

            let token;
            let title = `${name} added a new Post`;
            let body = `${postTitle}`;
            if (test) {
                token = JSON.parse(JSON.stringify(test)).token;

                // console.log('token from fireabseToken', token);
            }

            await sendFirebaseNotification(title, body, token);
            await Notification.create({
                senderId: userId,
                receiverId: id,
                content: `${postTitle}`,
                postId: postId,
                type: 'post'
            });

        });

        // console.log('connections', connectedUserIds);

    } catch (error) {
        console.log(error);
    }

};

// sendPostNotificationToAllConnections(5, "Akshay");

module.exports = { findUsersNotConnectedTo, sendPostNotificationToAllConnections };
