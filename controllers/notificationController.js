const { Op, where } = require('sequelize');
const { User, Comment, Post } = require('../models');
const { Notification } = require('../models');


const notificationCount = async (req, res) => {
    try {

        const result = await Notification.findAll({
            where: { receiverId: req.userData.id, isRead: false },
            include: [{
                model: User,
                as: 'sender',
                attributes: ['name', 'profileImage']
            }],

        });
        const finalResult = JSON.parse(JSON.stringify(result));
        // return res.status(400).json(finalResult);
        return res.json({ count: finalResult.length });

    } catch (error) {
        console.log(error);
        res.json(error);
    }
}

const readNotification = async (req, res) => {

    // console.log('req.params.commentId', req.params.notificationId);

    try {

        // const result = await Notification.destroy({
        //     where: { id: req.params.notificationId }
        // });

        const result = await Notification.update({ isRead: true }, {
            where: { id: req.params.notificationId }
        });

        return res.redirect('/notification')
    } catch (error) {
        console.log(error);
        return res.redirect('/notification')
    }

    return res.redirect('/notification');
}



const getAllNotification = async (req, res) => {
    try {

        const result = await Notification.findAll({
            where: { receiverId: req.userData.id, isRead: 0 },
            include: [{
                model: User,
                as: 'sender',
                attributes: ['name', 'profileImage']
            }],
            order: [
                ['createdAt', 'DESC'],
            ],

        });

        const finalResult = JSON.parse(JSON.stringify(result));

        console.log('notifications finalResult', finalResult);

        return res.render('notifications', { notifications: finalResult });
        // return res.status(400).json(finalResult);

    } catch (error) {
        console.log(error);
        res.json(error);
    }
}


module.exports = { readNotification, notificationCount, getAllNotification };