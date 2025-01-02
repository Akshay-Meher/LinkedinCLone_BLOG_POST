const express = require('express');
const { FirebaseToken } = require('../models');
const { checkAuth } = require('../middleware/check-auth');

const router = express.Router();
const admin = require("../helpers/firebase");


router.get('/firebase', (req, res) => {
    return res.render('firebase');
});


router.post("/saveToken", checkAuth, async (req, res) => {
    const { token } = req.body;
    const userId = req.userData.id;

    // console.log("userID ", userId, token);

    try {

        let existingToken = await FirebaseToken.findOne({
            where: { userId: userId }
        });


        if (existingToken) {
            // If it exists, update the token
            existingToken.token = token;
            await existingToken.save();
            // console.log('existingToken', existingToken);
        } else {
            // If it doesn't exist, create a new record
            await FirebaseToken.create({
                userId: userId,
                token: token
            });
        }

        return res.send("token saved.");

    } catch (error) {
        console.log("saveToken", error);
        return res.send(error);
    }
});


router.get('/getToken', checkAuth, async (req, res) => {

    console.log("req.userData.id", req.userData.id);

    try {
        const result = await FirebaseToken.findOne({
            where: { userId: req.userData.id }
        });
        // return res.status(200).json(JSON.parse(JSON.stringify(result)));
        return res.status(200).send(result.token);

    } catch (error) {
        console.log(error);
        return res.send(error);
    }

});


router.post("/sendNotification", async (req, res) => {
    try {
        const { token, payload } = req.body;
        console.log("Token notify::", token);
        console.log("Message notify::", payload);

        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            token: token,
        };

        await admin
            .messaging()
            .send(message)
            .then((response) => {
                console.log("Notification sent successfully:", response);
                res
                    .status(200)
                    .json({
                        message: "Notification send successfully",
                        response: response,
                    });
            })
            .catch((error) => {
                console.error("Error sending notification:", error);
                res.status(500).send("Error sending notification");
            });
    } catch (error) {
        console.log("Error while sending notification:", error);
        res
            .status(500)
            .json({ message: "Error while sending notification", response: null });
    }
});


module.exports = router;
