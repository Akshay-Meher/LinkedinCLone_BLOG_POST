const nodemailer = require('nodemailer');


// var transporter = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//         user: "dc4f199020b74a",
//         pass: "e88ca77ae749f5"
//     }
// });

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS
    }
});



const sendMail = (to, subject, text) => {
    const mailOptions = {
        from: 'akshaymeher2022@gmail.com',
        to: to,
        subject: subject,
        text: text
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log("Error while sending email: ", error);
        console.log("Email Sent: ", info.response);
    });
}

module.exports = { sendMail, transporter }