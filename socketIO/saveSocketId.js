const { where } = require('sequelize');
const { SocketId } = require('../models');

const saveSocketId = async (userId, socketId) => {

    console.log("userId", userId);
    console.log("socketId", socketId);

    try {
        const result = await SocketId.findOne({
            where: { userId: userId }
        });

        if (result) {
            await SocketId.update({ socketId: socketId }, {
                where: { userId: userId }
            });
        } else {
            await SocketId.create({
                userId, socketId
            });
        }

    } catch (error) {
        console.log(error);
    }
}



const getSocketId = async (userId) => {
    let result;
    try {
        result = await SocketId.findOne({
            where: { userId: userId }
        });
    } catch (error) {
        console.log(error);
    }
    if (result) {
        return result?.socketId
    }
};

module.exports = { saveSocketId, getSocketId };