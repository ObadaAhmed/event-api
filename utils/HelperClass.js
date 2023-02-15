require('dotenv').config()
const nodemailer = require('nodemailer');
const { MailtrapClient } = require("mailtrap");
const pool = require('../config/db_config')
const {HA_ERR_LOCK_WAIT_TIMEOUT} = require("mysql/lib/protocol/constants/errors");
const client = new MailtrapClient({
    token: '1c343658b4571ba8d7202ec394486a3f' , endpoint : 'https://sandbox.api.mailtrap.io/api/send/1480660'
});
exports.sendNotificationEmail = () => {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_TRAP_HOST,
            port: process.env.MAIL_TRAP_PORT,
            auth: {
                type: 'login',
                user: 'Obada_Ahmed',
                pass: 'b3f8f522a548bc91ccdc2701788f1d88'
            }
        });

        const mailOptions = {
            from: 'obadaahmedhassan04@gmail.com',
            to: 'obada.ahmed.hassan60@gmail.com',
            subject: 'Notification',
            text: 'This is a notification email.'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
}

exports.sendEmail = (subject , senderEmail , reciverEmail) => {

    const sender = { name: "Mailtrap Test", email: 'obadaahmedhassan60@gmail.com' };
    client
        .send({
            from: sender,
            to: [{ email: 'obadahassan60@gmail.com' }],
            subject: "Hello from Mailtrap!",
            text: "Welcome to Mailtrap Sending!",
        })
        .then(console.log, console.error);
}

exports.broadcastEmail =  (companyId, emailSubject, emailBody) => {

    const query = 'SELECT users.email, users.id FROM users JOIN follow ON users.id = follow.user_id WHERE follow.company_id = ?';

    pool.query(query, [companyId], async function(error, results) {
        if (error) {
            console.error('Error executing database query:', error);
        } else {
            const emailList = results.map(result => {
                return  result.email
            });
            const userIdList = results.map(result => result.id);
            console.log('email list : ',emailList.join(','))
            console.log('email list : ',userIdList)
            const transport = nodemailer.createTransport({
                host: process.env.MAIL_TRAP_HOST,
                port: process.env.MAIL_TRAP_PORT,
                auth: {
                    user: process.env.MAIL_TRAP_USERNAME,
                    pass: process.env.MAIL_TRAP_PASSWORD
                }
            });
            let info = await transport.sendMail({
                from: process.env.TEST_EMAIL,
                to: emailList.join(','),
                subject: emailSubject, // Subject line
                text: emailBody, // plain text body
                html: `<b>${emailBody}</b>`,
            })
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            addNotification(userIdList , companyId , 'emailBody')
        }
    });
}

addNotification = (usersList , companyId , message) => {
    let insertQuery = ` INSERT INTO notification(message , event_id , user_id) VALUES (?,?,?) `;
    usersList.forEach(userId => {
        let insertValues = [message , 1 , userId];
        pool.query(insertQuery , insertValues , (err , result) => {
            if (err) console.log(err);
            console.log('saved success')
        })
    })
}

