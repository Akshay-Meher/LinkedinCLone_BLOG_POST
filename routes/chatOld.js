const express = require('express');
const router = express.Router();
const { Chat, Message, User } = require('../models');
// const startChatController = require('../controllers/startChatController');
const { checkAuth } = require('../middleware/check-auth');
const { Op, where } = require('sequelize');
const { Json } = require('sequelize/lib/utils');


router.get('/start', checkAuth, async (req, res) => {

    // console.log("chat sdfasdf asdfasdf sdfsdfsadfsd", req.userData);

    try {

        const allUsers = await User.findAll({
            where: {
                id: {
                    [Op.not]: req.userData.id,
                },
            },
        });

        const a = JSON.stringify(allUsers);
        const b = JSON.parse(a);

        const loggedInUser = await User.findByPk(req.userData.id);
        // console.log("b users", b);
        const userStringify = JSON.stringify(loggedInUser);
        const userParse = JSON.parse(userStringify);
        // console.log("b loggedInUser", userParse);

        const allUsersData = b.map(user => ({
            id: user.id,
            loggedInUserId: req.userData.id,
            name: user.name,
            profileImage: user.profileImage,
            email: user.email
        }));

        return res.render("chat", {
            allUsersData,
            loggedInUser: {
                name: userParse.name,
                email: userParse.email,
                profileImage: userParse.profileImage
            }
        })

    } catch (error) {
        console.log(error);
    }

    res.render('chat');
});



router.post('/create', async (req, res) => {

    const { user1Id, user2Id } = req.body;
    console.log('user1Id', user1Id);
    console.log('user2Id', user2Id);

    try {
        let chat = await Chat.findOne({
            where: {
                userId1: user1Id,
                userId2: user2Id
            }
        });

        if (!chat) {

            chat = await Chat.create({ userId1: user1Id, userId2: user2Id });
        }

        // res.redirect(`/chat/${chat.id}`);
        return res.status(201).json({
            chatId: chat.id
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error
        });
    }

});


router.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
        const user2 = await Chat.findByPk(chatId, {
            attributes: ['userId2']
        });

        const user2Stringify = JSON.stringify(user2);
        const user2Parse = JSON.parse(user2Stringify);

        console.log('user2 gg', user2Parse);


        const receiverMessages = await Chat.findOne({
            where: { userId2: user2Parse.userId2 },
            include: [{ model: Message }]
        })

        console.log('receiverMessages', JSON.parse(JSON.stringify(receiverMessages)))


        const chat = await Chat.findByPk(chatId, {
            include: [
                {
                    model: Message,
                    // as: 'Messages',
                    // include: [{ model: User, as: 'Sender' }]
                    // include: [{ model: User }]
                }
            ]
        });

        const a = JSON.stringify(chat);
        const b = JSON.parse(a);

        // console.log('chat', b);
        console.log('senderMessages', b);

        return res.status(200).json({
            chat: b
        });
    } catch (error) {

        console.log(error);

        res.status(400).json({
            error
        });

    }

    // res.render('chat', { chat, user: req.userData });
});


router.get('/getMessages/:receiverId/:senderId', async (req, res) => {
    console.log("getMessages/:receiverId", req.params.receiverId);
    console.log("getMessages/:senderId", req.params.senderId);

    const senderId = req.params.senderId;
    const receiverId = req.params.receiverId;

    try {

        const result = await Message.findAll({
            where: { senderId, receiverId }
        });

        const result1 = await Message.findAll({
            where: { receiverId: senderId, senderId: receiverId }
        });

        console.log('allMessages', JSON.parse(JSON.stringify(result)));

        return res.status(200).json({
            sendMessages: JSON.parse(JSON.stringify(result)),
            receivedMessages: JSON.parse(JSON.stringify(result1))
        });

    } catch (error) {
        console.log(error);
        res.json({ error });
    }

    return res.send("hii");
});



// Route to handle sending a message
router.post('/sendMessage', async (req, res) => {
    const { chatId, senderId, receiverId, content, type } = req.body;


    const message = await Message.create({
        chatId,
        receiverId,
        senderId,
        content,
        type
    });


    // req.io.to(chatId).emit('receiveMessage', {
    //     chatId: chatId,
    //     senderId: senderId,
    //     content: content,
    //     type: type
    // });

    req.io.emit('receiveMessage', {
        chatId: chatId,
        receiverId,
        senderId: senderId,
        content: content,
        type: type
    });


    res.status(200).json({
        message: 'Message sent',
        data: message
    });
});

module.exports = router;

