const admin = require("firebase-admin");

const serviceAccount = require("../config/blog-post-api-300be-firebase-adminsdk-mk4yp-a4b231dae1.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;


























// //* Route to send a notification
// app.post('/send-notification', async (req, res) => {
//     const { token, title, body } = req.body;

//     if (!token || !title || !body) {
//         return res.status(400).send('Missing parameters');
//     }

//     const message = {
//         notification: {
//             title: title,
//             body: body,
//         },
//         token: token,
//     };

//     try {
//         const response = await admin.messaging().send(message);
//         res.status(200).send(`Successfully sent message: ${response}`);
//     } catch (error) {
//         console.error('Error sending message:', error);
//         res.status(500).send('Error sending message');
//     }
// });
