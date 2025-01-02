const { profile } = require("console");
const { User } = require("../models");
const fs = require('fs');
const path = require('path');
const { validationResult } = require("express-validator");





const updateprofileController = async (req, res) => {
    // console.log('profile', req.userData);
    const { name, email } = req.body;

    // console.log("Name, Email : ", name, email);
    // console.log("file", req.file);

    try {

        const errors = validationResult(req);
        // console.log('errorswewe', { errors: errors.mapped() });

        if (!errors.isEmpty()) {

            const resultUser = await User.findOne({
                where: { id: req?.userData?.id }
            })
            console.log('resultUser', resultUser);
            if (resultUser) {
                return res.render('profile', {
                    user: {
                        id: resultUser?.dataValues?.id,
                        profileImage: resultUser?.dataValues?.profileImage,
                        name: resultUser?.dataValues?.name,
                        email: resultUser?.dataValues?.email,
                    },
                    errors: errors.mapped()
                });
            }

        } else {

            if (req.file) {
                const src = path.join(__dirname, "../temp/", req?.file?.filename);
                const dest = path.join(__dirname, "../profile/", req?.file?.originalname);

                try {
                    fs.copyFileSync(src, dest);
                    console.log("File copied successfully!");
                } catch (err) {
                    console.error("Error copying the file:", err);
                    return res.status(500).send("Error while copying file!");
                }
                const result = await User.update({
                    profileImage: '/' + req.file.originalname,
                    name: name,
                    email: email
                },
                    {
                        where: { id: req.userData.id }
                    }
                );
            } else {
                const result = await User.update({
                    name: name,
                    email: email
                },
                    {
                        where: { id: req.userData.id }
                    }
                );
            }


            // console.log("res from update", result);

            const updatedUser = await User.findOne({
                where: { email: email }
            })


            if (updatedUser) {
                return res.redirect('/profile');
            }

        }

        return res.redirect('/profile');

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: error
        });
    }

}

module.exports = updateprofileController;