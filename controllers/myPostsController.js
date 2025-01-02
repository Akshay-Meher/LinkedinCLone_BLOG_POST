const { Post, User, Comment } = require("../models");


const myPostController = async (req, res) => {
    try {
        // console.log("Profile ", req.userData);
        // const result = await Post.findAll({
        //     where: {
        //         userId: req.userData.id,
        //         isDeleted: 0
        //     },
        //     include: [User]
        // });

        const result = await Post.findAll({
            where: {
                userId: req.userData.id,
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
                    attributes: ['name', 'profileImage']
                }
            ]
        });

        const isPostsAvailable = result.length;

        const posts = result.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,

            // imageUrl: post.imageUrl || "https://www.shutterstock.com/shutterstock/photos/49621654/display_1500/stock-photo-smiling-mature-golfer-on-golf-course-49621654.jpg",
            imageUrl: post.imageUrl.split(',') || "https://www.shutterstock.com/shutterstock/photos/49621654/display_1500/stock-photo-smiling-mature-golfer-on-golf-course-49621654.jpg",
            categoryId: post.categoryId,
            createdAt: post.createdAt,
            User: {
                name: post?.User?.name || 'Anonymous',
                profileImage: post?.User?.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            },
            Comments: post.Comments
        }));
        // console.log('posts With Comments', posts);
        // Render the template with the transformed data
        if (process.env.FRONTEND_TYPE == "NODE") {
            res.render('myPosts', { posts, isPostsAvailable });
            // res.status(200).json(posts);
        } else {
            res.status(200).json(result);
        }





        // console.log('POST result', result);

        // Map the result to a simpler format
        // const posts = result.map(post => ({
        //     id: post.id,
        //     title: post.title,
        //     content: post.content,
        //     imageUrl: post.imageUrl || "https://www.shutterstock.com/shutterstock/photos/49621654/display_1500/stock-photo-smiling-mature-golfer-on-golf-course-49621654.jpg",
        //     categoryId: post.categoryId,
        //     createdAt: post.createdAt,
        //     User: {
        //         name: post?.User?.name || 'Anonymous'
        //     }
        // }));
        // // console.log('Profile posts', posts);
        // // Render the template with the transformed data
        // if (process.env.FRONTEND_TYPE == "NODE") {
        //     res.render('myPosts', { posts });
        // } else {
        //     res.status(200).json(result);
        // }



        // console.log('result', result);
        // res.render('posts', { posts: result });
        // // res.status(200).json(result);
    } catch (error) {
        console.log("EERRRRRR", error);
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    }
}


module.exports = myPostController;
