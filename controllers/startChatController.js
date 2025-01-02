const { Op } = require('sequelize');
const { Chat, Message, User } = require('../models');


const startChatController = async (req, res) => {
    console.log("chat sdfasdf asdfasdf sdfsdfsadfsd", req.userData);

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

        // console.log("b users", b);

        const allUsersData = b.map(user => ({
            id: user.id,
            name: user.name,
            profileImage: user.profileImage,
            email: user.email
        }));
        return res.render("chat", { allUsersData })

    } catch (error) {
        console.log(error);
    }

    res.render('chat',);
}


module.exports = startChatController;