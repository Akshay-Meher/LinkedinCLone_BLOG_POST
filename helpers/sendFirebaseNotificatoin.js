const admin = require('./firebase');

async function sendFirebaseNotification(title, body, token) {

    // console.log('sendFirebaseNotification ');

    const message = {
        notification: {
            title: title,
            body: body,
        },
        token: token,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent successfully:", response);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

module.exports = sendFirebaseNotification;