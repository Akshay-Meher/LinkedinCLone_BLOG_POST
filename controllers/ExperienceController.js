const { Experience } = require('../models');


const experienceController = async (req, res) => {

    // console.log("add Expreance", req.params.userId);

    const { jobTitle, companyName, startDate, endDate } = req.body;

    try {

        const result = await Experience.create({
            userId: req.params.userId,
            jobTitle,
            companyName,
            startDate,
            endDate: endDate ? endDate : null
        });

        if (result) {
            console.log('result', result);
            return res.redirect('/profile');
        }

    } catch (error) {

        console.log(error);
        return res.status(404).json({
            error
        });

    }


}

module.exports = experienceController;