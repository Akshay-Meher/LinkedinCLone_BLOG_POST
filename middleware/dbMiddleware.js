const db = require('../models');


const dbMiidleware = async (req, res, next) => {
    try {
        // Test the database connection
        await db.sequelize.authenticate();
        next();
    } catch (error) {
        // Handle the database connection error
        console.error('Database connection error:', error);
        res.status(500).render('error', { error: 'Database connection failed. Please try again later.' });
    }
}

module.exports = dbMiidleware;