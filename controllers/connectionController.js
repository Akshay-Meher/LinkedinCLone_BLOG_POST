const sendFirebaseNotification = require("../helpers/sendFirebaseNotificatoin");
const { User, Connection, FirebaseToken, Notification } = require("../models");

const sendConnection = async (req, res) => {

    // console.log("userId khhjv", req.params.userId);
    // console.log("userdata", req.userData.id);

    const senderId = req.userData.id;
    const receiverId = req.params.userId;

    // console.log('senderId', senderId);
    // console.log('receiverId', receiverId);

    if (senderId == receiverId) {
        res.status(201).json({
            message: 'You cannot connect with yourself.'
        });
        return;
    }

    const existingConnection = await Connection.findOne({
        where: {
            userId: senderId,
            connectedUserId: receiverId
        }
    });

    if (existingConnection) {

        res.status(201).json({
            message: 'Connection request already sent or exists.'
        });

        return;
    }

    const result = await Connection.create({
        userId: senderId,
        connectedUserId: receiverId,
        status: 0
    });

    // console.log('result', result);


    try {

        const test = await FirebaseToken.findOne({
            where: { userId: receiverId }
        });


        // console.log('fireabseToken', test);

        let token;
        let title = `${req.userData.name} send connection request`;
        let body = `${req.userData.name} want to to connect with you`;
        if (test) {
            token = JSON.parse(JSON.stringify(test)).token;
            // console.log('token from fireabseToken', token);
        }
        await sendFirebaseNotification(title, body, token);

        await Notification.create({
            senderId,
            receiverId,
            content: `${req.userData.name} want to to connect with you`,
            type: 'connection'
        });

    } catch (error) {
        // Handle any errors thrown by sendNotification if necessary
        console.error("Notification sending failed:", error);
    }

    res.json({
        result: result.dataValues,
        message: 'Connection request send successfully.'
    });

};



const acceptConnectionRequest = async (req, res) => {
    const senderId = req.userData.id;
    const receiverId = req.params.userId;

    console.log('receiverId', receiverId);
    console.log('senderId', senderId);

    const connection = await Connection.findOne({
        where: {
            userId: receiverId,
            connectedUserId: senderId,
            // connectedUserId: receiverId,
            // userId: senderId,
            status: '0'
        }
    });

    if (!connection) {
        return res.status(201).json({
            message: 'No pending connection request found.'
        });
    }

    const updated = connection.update({ status: 1 });

    if (updated) {
        return res.json({
            result: updated,
            message: 'Connection request accepted successfully.'
        });
    }

}


const rejectConnectionRequest = async (req, res) => {
    const senderId = req.userData.id;
    const receiverId = req.params.userId;

    const connection = await Connection.findOne({
        where: {
            userId: receiverId,
            connectedUserId: senderId,
            // connectedUserId: receiverId,
            // userId: senderId,
            status: '0'
        }
    });

    console.log(JSON.parse(JSON.stringify(connection)).id);
    const connectionId = JSON.parse(JSON.stringify(connection)).id;



    if (!connection) {
        return res.status(201).json({
            message: 'No pending connection request found.'
        });
    }

    const updated = connection.update({ status: 1 });

    // console.log('updated', updated);

    Connection.destroy({
        where: { id: connectionId }
    });

    if (updated) {
        return res.json({
            result: updated,
            message: 'Connection request rejected successfully.'
        });
    }

}


module.exports = { sendConnection, acceptConnectionRequest, rejectConnectionRequest };