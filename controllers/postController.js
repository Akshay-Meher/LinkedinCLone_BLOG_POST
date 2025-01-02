const { Post, User, Comment, Connection, Notification, Like } = require('../models');
const Validator = require("fastest-validator");
const fs = require('fs');
const path = require('path');
// const { where, JSON } = require('sequelize');
const { validationResult } = require('express-validator');
const { findAllConnection } = require('./myNetworkController');
const { where } = require('sequelize');
const { sendPostNotificationToAllConnections } = require('../helpers/findUsersNotConnectedTo');

// const s = require('../temp/')



const save = async (req, res) => {

    // console.log("req.userData PostController", req.userData);
    console.log("req.files PostController", req.file);

    const post = {
        title: req.body.title,
        content: req.body.content,
        imageUrl: "/" + req.file.originalname,
        userId: req.userData.id
        // imageUrl: req.body.imageUrl,
        // imageUrl: "http://localhost:3000/uploads/" + req.file.originalname,
        // categoryId: 6,
    }

    const src = path.join(__dirname, "../temp/", req.file.filename);
    const dest = path.join(__dirname, "../uploads/", req.file.originalname);

    try {
        fs.copyFileSync(src, dest);
        console.log("File copied successfully!");
    } catch (err) {
        console.error("Error copying the file:", err);
        return res.status(500).send("Error while copying file!");
    }


    try {
        const result = await Post.create(post);
        if (process.env.FRONTEND_TYPE == "NODE") {
            res.status(201).redirect('/post');

        } else {
            res.status(201).json({
                massage: "Post created successfully",
                status: true,
                post: result
            });
        }

    } catch (error) {

        res.status(500).json({
            massage: "Something went wrong",
            status: false,
            error: error
        });
        console.log(error);
    }

}

const saveMultiple = async (req, res) => {
    console.log("req.files PostController", req.files); // req.files for multiple files

    // Prepare the post data
    const post = {
        title: req.body.title,
        content: req.body.content,
        userId: req.userData.id,
        imageUrl: [], // Store image paths as an array, can also be a string depending on schema
    };

    try {
        // Loop through each file in req.files
        for (const file of req.files) {
            const src = path.join(__dirname, "../temp/", file.filename); // Temporary location
            const dest = path.join(__dirname, "../uploads/", file.originalname); // Final location

            fs.copyFileSync(src, dest);
            console.log(`File ${file.originalname} copied successfully!`);

            post.imageUrl.push("/uploads/" + file.originalname);
        }


        post.imageUrl = post.imageUrl.join(',');

        // Save the post data to the database
        const result = await Post.create(post);


        //*find all connections of logedIn user

        await sendPostNotificationToAllConnections(req.userData.id, req.userData.name, req.body.title, result.id);



        // Respond to the client
        if (process.env.FRONTEND_TYPE == "NODE") {
            return res.status(201).redirect('/post');
        } else {
            return res.status(201).json({
                message: "Post created successfully",
                status: true,
                post: result
            });
        }

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "Something went wrong",
            status: false,
            error: error
        });
    }
};



const show = async (req, res) => {
    const id = req.params.id;

    try {
        const result = await Post.findByPk(id, {
            include: [User]
        });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                message: "Post ot Foud!"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    }

}


const index = async (req, res) => {
    try {

        const result = await Post.findAll({
            where: {
                isDeleted: 0
            },
            order: [['createdAt', 'desc']],
            include: [
                {
                    model: Comment,
                    // as: 'comments',
                    order: [['createdAt', 'desc']],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: User,
                    attributes: ['name', 'email', 'profileImage', 'id']
                },
                {
                    model: Like
                }
            ]
        });

        // console.log("posts info", JSON.parse(JSON.stringify(result)));

        // return res.json({ result });

        // let isLiked = result.Likes.some(like => like.userId == req.userData.id);

        // console.log('isLiked', isLiked);

        const posts = result.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl.split(',') || "https://www.shutterstock.com/shutterstock/photos/49621654/display_1500/stock-photo-smiling-mature-golfer-on-golf-course-49621654.jpg",
            categoryId: post.categoryId,
            createdAt: post.createdAt,
            User: {
                id: post?.User?.id,
                name: post?.User?.name || 'Anonymous',
                email: post?.User?.email,
                profileImage: post?.User?.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            },
            Comments: post.Comments,
            totalLikes: post.Likes.length,
            isLiked: post.Likes.some(like => like.userId == req.userData.id)

        }));
        // console.log('posts With Comments', posts);
        // Render the template with the transformed data
        // console.log("result from postControler", posts);


        const userProfile = await User.findByPk(req?.userData?.id);
        // console.log('userProfile', userProfile);

        const userProfileInfo = {
            name: userProfile.dataValues.name,
            email: userProfile?.dataValues?.email,
            profileImage: userProfile?.dataValues?.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        }

        const allConnection = await findAllConnection(req.userData.id);

        // console.log('allConnection 2', allConnection);

        const isPostsAvailable = result.length;
        if (process.env.FRONTEND_TYPE == "NODE") {
            res.render('posts', { posts, isPostsAvailable, userProfileInfo, allConnection });
            // res.status(200).json(posts);
        } else {
            res.status(200).json(result);
        }

        // console.log('result', result);
        // res.render('posts', { posts: result });
        // // res.status(200).json(result);
    } catch (error) {
        console.log("EEEEEERRRRRR", error);
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    }
}



const update = async (req, res) => {
    const id = req.params.postId;


    // console.log("update ", req.params.postId);
    // console.log("body ", title, content);
    // return res.redirect('/post/update/' + req.params.postId);

    const updatedPost = {
        title: req.body.title,
        content: req.body.content,
    }






    try {

        const errors = validationResult(req);
        // console.log('errorswewe', { errors: errors.mapped() });
        if (!errors.isEmpty()) {

            const postData = await Post.findOne({
                where: { id: req.params?.postId }
            });
            // console.log("update Res", postData);
            return res.render('updatePost', { post: postData.dataValues, errors: errors.mapped() });

        }



        const result = await Post.update(updatedPost, {
            where: {
                id: id,
            }
        });


        return res.redirect('/post');

        // res.status(200).json({
        //     message: "Post updated Successfully",
        //     post: updatedPost
        // });
    } catch (error) {


        console.log(error);

        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    }

}


const getUpdate = async (req, res) => {

    console.log("PostId", req.params.postId);

    try {
        const result = await Post.findOne({
            where: { id: req.params?.postId }
        });


        // console.log("update Res", result);

        return res.render('updatePost', { post: result.dataValues });

    } catch (error) {
        console.log(error);

        return res.json({
            error
        });
    }


}


const destroy = async (req, res) => {
    const id = req.params.id;
    const userId = req.userData.id;

    try {
        const result = Post.update({
            "isDeleted": 1
        },
            {
                where: {
                    id: id,
                    userId: userId
                }
            });

        if (process.env.FRONTEND_TYPE == "NODE") {
            res.redirect("/Profile");

        } else {
            res.status(200).json({
                message: "Post deleted successfully",
                result: result

            });
        }

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

module.exports = { save, show, index, update, destroy, getUpdate, saveMultiple };