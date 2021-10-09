const nodemailer = require('nodemailer')
exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: '',
        pass: ''
    }
});

