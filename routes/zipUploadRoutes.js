const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
// const fs = require('fs').promises; // Use promises for file operations
const { pipeline } = require('stream');
const util = require('util');
const path = require('path');
const { body } = require('express-validator');


router.get('/', (req, res) => {
    res.render('upload');
});


// Multer setup: we don't need a diskStorage here as we'll handle chunking manually
const upload = multer({ dest: 'uploads/' });

router.post('/chunk', (req, res) => {
    const userId = req.body.userId;
    const chunkIndex = req.body.chunkIndex;
    const totalChunks = req.body.totalChunks;
    const filename = req.body.filename;

    console.log('body', req.body);

    console.log('chunkIndex', chunkIndex);
    console.log('totalChunks', totalChunks);
    console.log('filename', filename);

    const userDir = `./uploads/user_${userId}`;
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }

    const chunkPath = path.join(userDir, `${filename}.part.${chunkIndex}`);

    const fileStream = fs.createWriteStream(chunkPath);
    req.pipe(fileStream);

    fileStream.on('close', () => {
        res.json({ status: 'success', chunkIndex: chunkIndex });

        // Once all chunks are uploaded, combine them into the final file
        if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
            const finalPath = path.join(userDir, filename);
            const writeStream = fs.createWriteStream(finalPath);
            for (let i = 0; i < totalChunks; i++) {
                const chunkFilePath = path.join(userDir, `${filename}.part.${i}`);
                const data = fs.readFileSync(chunkFilePath);
                writeStream.write(data);
                fs.unlinkSync(chunkFilePath); // Remove the chunk after writing
            }
            writeStream.end();
        }
    });
});

module.exports = router;