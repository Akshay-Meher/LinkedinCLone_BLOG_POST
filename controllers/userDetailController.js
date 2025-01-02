const { User, Experience } = require('../models');

const userDetailController = async (req, res) => {

    try {

        const result = await User.findByPk(req?.params?.userId || 45);
        // console.log("UserDetails", result);
        const userId = req?.params?.userId;

        const experiences = await Experience.findAll({
            where: { userId }
        });


        const allExperiences = experiences.map(exp => ({
            jobTitle: exp.jobTitle,
            companyName: exp.companyName,
            description: exp.description,
            startDate: exp.startDate,
            endDate: exp.endDate
        }));

        // console.log('experience', allExperiences);

        if (result) {
            return res.render('detailProfile', {
                User: {
                    id: result?.dataValues.id,
                    name: result?.dataValues.name,
                    email: result?.dataValues.email,
                    profileImage: result?.dataValues.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                },
                experiences: allExperiences
            });
        }

    } catch (error) {
        console.log(error);
        return res.status('404').json({
            error: error
        });
    }


    console.log("userID", req.params.userId);

}

module.exports = userDetailController;