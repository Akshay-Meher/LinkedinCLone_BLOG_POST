const multer = require('multer');
const path = require('path');
const fs = require('fs');



if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('chunks')) {
    console.log('chunks');
    fs.mkdirSync('chunks');
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        console.log('file', file);

        cb(null, 'chunks/');  // Store file chunks in this directory
    },
    filename: (req, file, cb) => {
        const { chunkIndex } = req.body;
        cb(null, `${file.originalname}-chunk-${chunkIndex}`);
    }
});

const upload1 = multer({ storage });

module.exports = upload1;