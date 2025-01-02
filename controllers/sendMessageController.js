


const sendMessageController = async (req, res) => {
    const userId = req.user.id; // Assume user is authenticated
    const { message, messageType } = req.body;
    let fileUrl = null;

    if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
    }

    const newMessage = {
        userId,
        message: messageType === 'text' ? message : null,
        messageType,
        fileUrl
    };

    io.emit('chatMessage', newMessage); // Emit the message to all clients
    res.status(201).send(newMessage);
}