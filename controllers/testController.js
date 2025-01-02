const models = require('../models');
async function test(req, res) {

    //One to one - 1:1 - a user has one address, or an address belongs to only one user
    //One to many - 1:m - a user has many posts
    //Many to many - m:n - a post belongs to many categories


    // //* One to one - 1:1 - a user has one address, or an address belongs to only one user
    // const user = await models.User.findByPk(2, {
    //     include: [models.Address]
    // });

    // //*  Vise-versa 
    // const address = await models.Address.findByPk(4, {
    //     include: [models.User]
    // });


    // //* One to many - 1:m - a user has many posts
    const userWithPosts = await models.User.findByPk(4, {
        include: [models.Post]
    });


    ////* Many to many - m:n - a post belongs to many categories
    const postWithCotegories = await models.Post.findByPk(2, {
        include: [models.Catergory]
    })

    res.status(200).json({
        data: postWithCotegories
    });
}




module.exports = {
    test: test
}





// async function test(req, res) {

//     //One to one - 1:1 - a user has one address, or an address belongs to only one user
//     //One to many - 1:m - a user has many posts
//     //Many to many - m:n - a post belongs to many categories

//     //One to one
//     // const user = await models.User.findByPk(19, {
//     //     include:[models.Address]
//     // });

//     // const address = await models.Address.findByPk(1, {
//     //     include:[models.User]
//     // });

//     //One to many
//     // const user = await models.User.findByPk(19, {
//     //     include:[models.Post]
//     // });

//     //Many to many
//     const post = await models.Post.findByPk(1, {
//         include:[models.Category]
//     });

//     const category = await models.Category.findByPk(2, {
//         include:[models.Post]
//     });



//     res.status(200).json({
//         data: category
//     });
// }
