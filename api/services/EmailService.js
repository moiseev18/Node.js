/**
 * Created by Emmanuel on 4/16/2016.
 */

var nodemailer = require('nodemailer');
var emailConfig = require('../../config/email');

module.exports = {

    send: function (toAddress, subject, content, next) {

        // create reusable transporter object using SMTP transport
        var transporter = nodemailer.createTransport(emailConfig.mailgun);

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: 'Tied Application', // sender address
            to: toAddress, // list of receivers
            subject: subject, // Subject line
            text: 'Hello tied app', // plaintext body
            html: content // html body
        };

        // send mail with defined transport object
        console.info('mailOptions', mailOptions);
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
            next();
        });
    }
};
