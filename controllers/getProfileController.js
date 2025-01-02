
const { User, Experience } = require('../models');


const getProfileController = async (req, res) => {

    // console.log('profile', req.userData);
    const userId = req?.userData?.id || 0;

    try {

        const result = await User.findOne({
            where: { id: req?.userData?.id }
        });

        const experiences = await Experience.findAll({
            order: [['createdAt', 'DESC']],
            where: { userId },
            // order: ['createdAt', 'DESC']
        });


        const allExperiences = experiences.map(exp => ({
            jobTitle: exp.jobTitle,
            companyName: exp.companyName,
            description: exp.description,
            startDate: exp.startDate,
            endDate: exp.endDate
        }));

        // console.log('allExperiences', allExperiences);
        if (result) {
            return res.render('profile', {
                user: {
                    id: result?.dataValues?.id,
                    profileImage: result?.dataValues?.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                    name: result?.dataValues?.name,
                    email: result?.dataValues?.email,
                },
                experiences: allExperiences
            });
        }

        res.redirect('/post');

    } catch (error) {
        console.log(error);
    }

}

module.exports = getProfileController;