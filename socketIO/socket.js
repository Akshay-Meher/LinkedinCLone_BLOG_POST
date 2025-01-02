const { io } = require('../app');

const { saveSocketId, getSocketId } = require('../socketIO/saveSocketId');

const { Message, FirebaseToken, User, Notification } = require('../models');
const sendFirebaseNotification = require('../helpers/sendFirebaseNotificatoin');


const userWithSocketId = {};

io.on('connection', (socket) => {

    console.log('a user connected', socket.id);

    socket.on('join', async (userId) => {

        socket.join(userId);
        console.log(`User ${userId} joined room`);
        userWithSocketId[userId] = socket.id;
        console.log('userWithSocketId', userWithSocketId);

        await saveSocketId(userId, socket.id);

    });


    socket.on('send_message', async (msg) => {
        const { senderId, receiverId, content, type, filename } = msg;

        console.log('send_message listening ', msg);

        if (!senderId || !receiverId || !content) {
            return;
        }

        const message = await Message.create({ senderId, receiverId, content, type });
        const notification = await Notification.create({ senderId, receiverId, content, type: 'message' });

        const token = await FirebaseToken.findOne({
            where: { userId: receiverId }
        });


        const currentUser = await User.findByPk(senderId);
        // console.log('token', token.token);
        // console.log('message', message);
        // console.log('currentUser', currentUser.name);


        if (token) {
            let title = `message from ${currentUser.name}`;
            let body = `${message.content}`
            let token1 = token.token;
            sendFirebaseNotification(title, body, token1);
        }

        let senderSocketId = await getSocketId(senderId);;
        let reciverSocketId = await getSocketId(receiverId);

        if (reciverSocketId && senderSocketId) {
            io.to(reciverSocketId).emit('receiveMessage', msg);
            // io.to(senderSocketId).emit('receiveMessage', message);
        } else {
            console.log('socketId not found');
        }

    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});