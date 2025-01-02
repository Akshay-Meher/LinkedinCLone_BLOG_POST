const downloadFile = async (req, res) => {
    console.log("INSIDE THE DOWNLOADFILE");

    try {

        const file = await ChatModel.findOne({
            where: { id: req.params.chat_id },
        });

        console.log("236::", file);

        const jsonData = JSON.parse(file.content);

        const downloadPath = path.join(
            __dirname,
            "../public/uploads/fileSend",
            `${req.user.id}/${jsonData.path}`
        );

        res.download(downloadPath);

    } catch (error) {
        console.log("Error while downloading file", error);
    }
};

module.exports = { downloadFile };