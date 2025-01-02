const express = require('express');
const router = express.Router();
const { Chat, Message, User } = require('../models');
// const startChatController = require('../controllers/startChatController');
const { checkAuth } = require('../middleware/check-auth');
const { Op, where } = require('sequelize');
const upload = require('../helpers/messageFileUploading');
const path = require('path');
const fs = require('fs');
const { downloadFile } = require('../controllers/chatController');

//* Define the route to handle file uploads

router.post('/upload', checkAuth, upload.single('file'), (req, res) => {
    const file = req.file;

    // console.log('file.originalname', file.originalname);
    if (file) {
        const userDirPath = path.join(
            __dirname,
            "../public/uploads/fileSend",
            req.userData.id.toString()
        );

        // Create the user-specific directory if it doesn't exist
        if (!fs.existsSync(userDirPath)) {
            fs.mkdirSync(userDirPath, { recursive: true });
        }

        const src = path.join(__dirname, "../public/temp/", file.filename);
        const dest = path.join(userDirPath, file.originalname);

        try {
            fs.copyFileSync(src, dest);
            console.log("File copied successfully:", file.originalname);
            return res.status(200).send({ filePath: `uploads/fileSend/${req.userData.id.toString()}/${file.originalname}`, type: 'file', filename: file.originalname });
        } catch (err) {
            console.error("Error copying file:", err);
        }
    } else {
        return res.status(400).send({ error: 'Please upload a file.' });
    }

});

//* download files 
router.get('/download', checkAuth, downloadFile);


// Get unread messages 
router.get('/get-unread-messsages', checkAuth, async (req, res) => {

    try {

        const allMesages = await Message.findAll({
            where: { receiverId: req.userData.id, isRead: false }
        });

        return res.status(200).json(allMesages);

    } catch (error) {

        console.log(error);
        return res.status(500).json(error);
    }
});


router.get('/markRead-messges/:senderId', checkAuth, async (req, res) => {


    const { senderId } = req.params;
    const receiverId = req.userData.id;
    console.log('/markRead-messges/:senderId', senderId);
    if (!senderId || !receiverId) return res.status(500).json('senderId is not provided');

    try {

        // const allMesages = await Message.findAll({
        //     where: { receiverId: receiverId, senderId: senderId }
        // });

        const result = await Message.update(
            { isRead: true },
            {
                where: {
                    receiverId: receiverId,
                    senderId: senderId
                }
            }
        );

        console.log('update result ', result);
        res.status(200).json(result);

    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
});



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
            profileImage: user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            email: user.email
        }));

        return res.render("chat", {
            allUsersData,
            loggedInUser: {
                name: userParse.name,
                email: userParse.email,
                profileImage: userParse.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
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

    if (!chatId) return;

    try {
        const user2 = await Chat.findByPk(chatId, {
            attributes: ['userId2']
        });

        const user2Stringify = JSON.stringify(user2);
        const user2Parse = JSON.parse(user2Stringify);

        console.log('user2 gg', user2Parse);


        const receiverMessages = await Chat.findOne({
            where: { userId2: user2Parse?.userId2 },
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


//* lazy Loading

router.get('/getMessages/:receiverId/:senderId', async (req, res) => {
    const senderId = req.params.senderId;
    const receiverId = req.params.receiverId;

    // Get the offset and limit from query parameters (default: limit 10, offset 0)
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    console.log('limit', 'offset', limit, offset);

    try {
        // Use offset and limit in the query
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            order: [['createdAt', 'DESC']],  // Order messages by creation time
            limit: limit,  // Limit the number of messages
            offset: offset // Skip 'offset' number of messages
        });

        return res.status(200).json({
            allMessages: messages
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
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
        type: type,
        createdAt: Date.now()
    });


    res.status(200).json({
        message: 'Message sent',
        data: message
    });
});



// Get ALl users
router.get('/', checkAuth, async (req, res) => {

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


        return res.status(200).json(b);
    } catch (error) {
        console.log('chat/allUsers', error);
        res.status(500).json(error);
    }

});


module.exports = router;

