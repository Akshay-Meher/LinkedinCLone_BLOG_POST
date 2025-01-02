const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const dirPath = path.join(__dirname, '../public/temp');

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        return cb(null, dirPath);
    },
    filename: function (req, file, cb) {
        const timestampedFilename = `${Date.now()}-${file.originalname}`;
        return cb(null, timestampedFilename);
    }
});

// Configure Multer middleware
const upload = multer({
    storage: storage,
    // limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

module.exports = upload;