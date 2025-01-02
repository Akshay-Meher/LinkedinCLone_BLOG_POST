const { where, Op } = require("sequelize");
const { User, Connection } = require("../models");
const { findUsersNotConnectedTo } = require("../helpers/findUsersNotConnectedTo");


const findAllConnection = async (userId) => {
    try {

        const connections = await Connection.findAll({
            where: { userId: userId, status: 1 },
            include: [
                {
                    model: User,
                    attributes: ['name', 'profileImage']
                }
            ]
        });


        // console.log('findAllConnection', connections);

        if (connections) {
            const a = JSON.stringify(connections);
            const b = JSON.parse(a);
            // console.log("connections B", b);
            const connectionRequests = await Promise.all(b?.map(async (conn) => {
                const user = await User.findOne({ where: { id: conn.connectedUserId } });
                return {
                    connectedUserId: conn.connectedUserId,
                    profilePic: user?.profileImage,
                    name: user?.name
                };

            }));

            return connectionRequests
        }


        return null;
    } catch (error) {
        console.log(error);
    }
}



const findAllReq = async (req, res) => {
    try {
        const connections = await Connection.findAll({
            where: { connectedUserId: req.userData.id, status: 0 },
            include: [
                {
                    model: User,
                    attributes: ['name', 'profileImage']
                }
            ]
        });

        console.log("findAllReq", JSON.parse(JSON.stringify(connections)).length);

        const result = JSON.parse(JSON.stringify(connections));

        return res.status(200).json({ totalReq: result.length });

    } catch (error) {
        console.log(error);
        // res.send(error);
        return res.status(400).json({ error });
    }
}




const myNetworkController = async (req, res) => {
    try {

        // console.log("Userdata", req.userData.id);

        // const connections = await User.findOne({
        //     where: { id: req.userData.id },
        //     include: [
        //         {
        //             model: Connection,
        //             where: { status: 0 },
        //             include: [
        //                 {
        //                     model: User,
        //                     attributes: ['name', 'profileImage']
        //                 }
        //             ]
        //         }
        //     ]
        // });

        // console.log('connections', connections);

        const connections = await Connection.findAll({
            where: { connectedUserId: req.userData.id, status: 0 },
            include: [
                {
                    model: User,
                    attributes: ['name', 'profileImage']
                }
            ]
        });


        if (connections) {
            const a = JSON.stringify(connections);
            const b = JSON.parse(a);
            // console.log("connections B", b);

            const connectionRequests = await Promise.all(b?.map(async (conn) => {
                // const user = await User.findOne({ where: { id: conn.connectedUserId } });
                return {
                    connectedUserId: conn.userId,
                    profilePic: conn?.User?.profileImage,
                    name: conn?.User?.name
                };

            }));

            const allConnection = await findAllConnection(req.userData.id);

            const UsersNotConnectedTo = await findUsersNotConnectedTo(req.userData.id);

            return res.render('myNetwork', { connectionRequests, allConnection, allUsers: UsersNotConnectedTo });

        } else {
            return res.render('myNetwork', { connectionRequests: [] });
        }


    } catch (error) {
        // Handle any errors that occur
        console.error("Error fetching connections:", error);
        res.status(500).send("Internal Server Error");
    }
};



module.exports = { myNetworkController, findAllConnection, findAllReq };




