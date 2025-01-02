const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
// const fs = require('fs').promises; // Use promises for file operations
const { pipeline } = require('stream');
const util = require('util');
const path = require('path');
const { checkAuth } = require('../middleware/check-auth');


router.get('/', (req, res) => {
    res.render('upload');
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../temp"));
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Multer setup: we don't need a diskStorage here as we'll handle chunking manually
// const upload = multer({ dest: 'uploads/' });

let CHUNKS_DIR;
let userId;

// const CHUNKS_DIR = path.join(__dirname, "../uploads/chunk");
const chunkPathArr = [];


async function assembleChunks(filename, totalChunks) {

    CHUNKS_DIR = `./uploads/user_${userId}`;
    if (!fs.existsSync(CHUNKS_DIR)) {
        fs.mkdirSync(CHUNKS_DIR, { recursive: true });
    }


    console.log('filename', filename);
    console.log('totalChunks outer', typeof totalChunks);

    const writer = fs.createWriteStream(`./uploads/${filename}`);

    // for (let i = 1; i <= Number(totalChunks); i++) {
    //     const chunkPath = `${CHUNKS_DIR}/${filename}.${i}`;
    //     console.log(`Processing chunk ${i} of ${totalChunks}`);

    //     // Check if chunk file is readable
    //     try {
    //         fs.accessSync(chunkPath, fs.constants.R_OK);
    //         console.log(`Chunk ${i} is readable.`);
    //     } catch (err) {
    //         console.error(`Error: Chunk ${i} is not readable.`, err);
    //         throw err;
    //     }

    //     // Check if the writer is ready (handle backpressure)
    //     if (!writer.write) {
    //         console.log(`Waiting for writer drain at chunk ${i}...`);
    //         await new Promise((resolve) => writer.once('drain', resolve));
    //     }

    //     try {
    //         // Logging for more detailed stream handling
    //         const readStream = fs.createReadStream(chunkPath);
    //         console.log(`Created read stream for chunk ${i}`);

    //         // Pipe manually instead of using pipeline

    //         readStream.on('error', (err) => {
    //             console.error(`Error reading chunk ${i}:`, err);
    //         });

    //         writer.on('error', (err) => {
    //             console.error(`Error writing chunk ${i}:`, err);
    //         });

    //         await new Promise((resolve, reject) => {
    //             readStream.pipe(writer).on('finish', resolve).on('error', reject);
    //         });

    //         console.log(`Successfully processed chunk ${i}`);
    //     } catch (err) {
    //         console.error(`Error processing chunk ${i}:`, err);
    //         throw err;
    //     }

    //     // Clean up by deleting the chunk
    //     fs.unlink(chunkPath, (err) => {
    //         if (err) {
    //             console.error(`Error deleting chunk ${i}:`, err);
    //         } else {
    //             console.log(`Deleted chunk ${i}`);
    //         }
    //     });
    // }


    for (let i = 1; i <= Number(totalChunks); i++) {

        console.log('totalChunks inner', totalChunks, i);
        const chunkPath = `${CHUNKS_DIR}/${filename}.${i}`;

        const pipelineAsync = util.promisify(pipeline);
        // await pipelineAsync(fs.createReadStream(chunkPath), writer);

        try {
            // const stats = fs.statSync(chunkPath);
            fs.accessSync(chunkPath, fs.constants.R_OK);
            console.log("dummy ");
            // console.log(`Processing chunk ${i} (size: ${stats.size} bytes)`);
        } catch (err) {
            console.error(`Error reading stats for chunk ${i}:`, err);
            throw err;
        }

        try {

            // let result1 = await pipelineAsync(fs.createReadStream(chunkPath), writer);
            // console.log('result1', result1);

            await pipelineAsync(fs.createReadStream(chunkPath), writer)
                .then((res) => {
                    console.log(`then ${i}`, res);
                })
                .catch((err) => {
                    console.log(err);
                })

            // console.log('chunkPath', chunkPath);

        } catch (err) {
            console.error('Error reading chunk file:', err);
            // throw err; // Propagate the error
        }


        // await pipeline(pump(fs.createReadStream(chunkPath)), pump(writer));

        // fs.unlink(chunkPath, (err) => {
        //     console.log('unlink', err);
        //     if (err) {
        //         console.error('Error deleting chunk file:', err);
        //     }
        // });
    }
}


async function deleteAllChunks(directoryPath) {

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(async (file) => {
            // console.log('file', file);
            const filePath = path.join(directoryPath, file);

            await fs.chmod(directoryPath, 0o666, (err) => { console.log('err', err) });

            await fs.promises.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${file}:`, err);
                } else {
                    console.log(`Successfully deleted file: ${file}`);
                }
            });

        });
    });
}


function deleteAllChunksForcefully(directoryPath) {
    fs.rm(directoryPath, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error('Error deleting directory and files:', err);
        } else {
            console.log(`Successfully deleted all files in: ${directoryPath}`);
        }
    });
}

router.post('/chunk', checkAuth, upload.single('file'), (req, res) => {
    userId = req.userData.id;
    let CHUNKS_DIR = `./uploads/user_${userId}`;

    if (!fs.existsSync(CHUNKS_DIR)) {
        fs.mkdirSync(CHUNKS_DIR, { recursive: true });
    }



    const { file, body: { totalChunks, currentChunk } } = req;

    const chunkFilename = `${file.originalname}.${currentChunk}`;
    // const chunkPath = `${CHUNKS_DIR}/${chunkFilename}`;
    const chunkPath = path.join(CHUNKS_DIR, chunkFilename);



    fs.rename(file.path, chunkPath, (err) => {
        if (err) {
            console.error('Error moving chunk file:', err);
            res.status(500).send('Error uploading chunk');
        } else {
            if (currentChunk === totalChunks) {
                // All chunks have been uploaded, assemble them into a single file
                assembleChunks(file.originalname, totalChunks)
                    .then(() => {
                        deleteAllChunks(CHUNKS_DIR);
                        // deleteAllChunksForcefully(CHUNKS_DIR);
                        res.send('File uploaded successfully');
                    })
                    .catch((err) => {
                        console.error('Error assembling chunks:', err);
                        res.status(500).send('Error assembling chunks');
                    });
            } else {
                res.send('Chunk uploaded successfully');
            }
        }
    });
});

module.exports = router;