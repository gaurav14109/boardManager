const User = require('../models/user')
const {validationResult} = require('express-validator');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config')
const fs = require('fs');
const path = require('path');
const Otp = require('../models/otp')
const {transporter} = require('../config/nodemailer')
const {otpGenerator} = require('../config/otpGenerator')
const client = require('../config/sms')

function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}
module.exports.signUp = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({errors: errors.array()});
    }
    const whitelist = ['name', 'email', 'password', 'phone']
    try {
        const checkUserByEmail = await User.findOne({email: req.body[whitelist[1]]})
        const checkUserByPhone = await User.findOne({phone: req.body[whitelist[3]]})
        if (checkUserByEmail || checkUserByPhone) {
            return res.send('User Already Registered')
        }

        const userDetails = {}

        for (property in req.body) {

            if (whitelist.indexOf(property) === -1) {

                return res.send('Unknown Property')

            }
            userDetails[property] = req.body[property]
        }
        const avatar = gravatar.url(req.body.email, {
            s: "200", //sizes
            r: "pg", //good images
            d: "mm"
        })
        userDetails['avatar'] = avatar
        const newuser = new User(userDetails)
        await newuser.save()
        res.send('User Created Successfully Kindly Login');
    } catch (err) {

        res
            .status(500)
            .json({message: err.message})
    }
}

module.exports.emailPassLogin = async (req, res) => {
    const whitelist = ['email', 'password']
    const {email, password} = req.body

    for (property in req.body) {

        if (whitelist.indexOf(property) === -1) {
            return res.send('Unknown Property')
        }

    }
    try {
        const user = await User.findOne({email: email})

        if (!user) {

            return res.send('Invalid Email')
        }

        if (!user.authenticate(password)) {

            return res
                .status(401)
                .json({message: 'Invalid Password'})
        }
        //Genrate the token and send to client generate JWT and send it to client
        const userData = {
            email: user.email,
            id: user._id
        }
        const token = jwt.sign(userData, config.jwtsecret)

        res.json({token: token, msg: 'User Logged in Successfully'})
    } catch (err) {

        res
            .status(500)
            .json({message: err.message})
    }

}

// Generating new token after email updated
module.exports.updateUserDetails = async (req, res) => {
    try {
        const userid = req.params.userid
        if (userid !== req.user.id) {

            return res
                .status(401)
                .json({message: 'Not Authorized'})
        }
        const user = await User.findOne({email: req.user.email})
        if (!user) {

            return res.send('Not authorized');
        }
        User.uploadedAvatar(req, res, function (err) {
            if (err) {
                console.log('*****Multer Error: ', err)
            }
            const {name, email, phone} = req.body

            user.name = name
            user.email = email
            user.phone = phone

            if (req.file) {
                if (user.avatar) {
                    //path helps to generate path where fs to check file and open
                    if (!(fs.existsSync(path.join(__dirname, '..', user.avatar)))) {
                        user.avatar = User.avatarPath + '/' + req.file.filename;
                    } else {

                        fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                        user.avatar = User.avatarPath + '/' + req.file.filename;
                    }

                }
            }
            user.save()
            res
                .status(200)
                .json({message: 'Profile Updated Successfully'})
        })

    } catch (err) {
        console.log(err);
    }
}

// Generating new token after password updated
module.exports.updatePassword = async (req, res) => {

    try {
        const userid = req.params.userid
        if (userid !== req.user.id) {

            return res
                .status(401)
                .json({message: 'Not Authorized'})
        }
        const user = await User.findOne({email: req.user.email});

        if (!user) {
            return res.send('Not authorized');
        }
        const {password} = req.body;
        if (user.generateUpdatePassword(password)) {

            user.save()
            res.send('Password Updated Successfully');
        }

    } catch (err) {
        console.log(err);
    }
}

// email otp generator
module.exports.emailOtpGenerator = async (req, res) => {
    //at email otp only email will be received
    const {email} = req.body

    if (!email) {

        return res.send('Email not Provided!')
    }

    try {
        const user = await User.findOne({email: email})
        if (!user) {
            return res.send('No Such User!')
        }
        const otp = otpGenerator()

        const expiration_time = AddMinutesToDate(new Date(), 10)
        const otp_instance = await new Otp({otp: otp, expiration: expiration_time})

        //send email and otp id in jwt as json object
        const details = {
            otp_id: otp_instance._id,
            email: email
        }
        await otp_instance.save()

        const encoded_token = jwt.sign(details, config.otpSecret)
        const mailOptions = {
            from: 'gauravgusain48@gmail.com',
            to: 'gusaing1410@gmail.com',
            subject: 'Otp for Login',
            text: `Your Otp is ${otp}`
        };

        await transporter.sendMail(mailOptions)
        res.json({otp_token: encoded_token})

    } catch (err) {
        console.log(err)
    }
}

//phone otp generator
module.exports.phoneOtpGenerator = async (req, res) => {

    const {phone} = req.body

    if (!phone) {

        return res.send('phone number not Provided!')
    }

    try {
        const user = await User.findOne({phone: phone})
        if (!user) {
            return res.send('No Such User!')
        }
        const otp = otpGenerator()

        const expiration_time = AddMinutesToDate(new Date(), 10)
        const otp_instance = await new Otp({otp: otp, expiration: expiration_time})

        //send email and otp id in jwt as json object
        const details = {
            otp_id: otp_instance._id,
            phone: phone
        }
        await otp_instance.save()

        const encoded_token = jwt.sign(details, config.otpSecret)
        client
            .messages
            .create({
                from: '+14842638823',
                body: otp,
                to: '+91' + phone
            })
            .then(
                message => res.json({otp_token: encoded_token, msg: 'Otp sent successfully'})
            )
            .catch(err => console.log(err))

        } catch (err) {
        console.log(err)
    }
}

module.exports.verifyOtp = async (req, res) => {
    //phone or email
    const {email, otp_token, otp, phone} = req.body
    var user = ""

    if (!email && !phone) {
        return res.send('Email or Phone not present')
    }
    if (!otp_token) {
        return res.send('Token not present')
    }
    const decoded_token = jwt.verify(otp_token, config.otpSecret)

    const decode_token = {
        otp_id: decoded_token.otp_id,
        phoneemail: decoded_token.email
            ? decoded_token.email
            : decoded_token.phone
    }
    //comparing otp id and otp number
    try {
        if (email) {
            if (decode_token.phoneemail !== email) {
                return res.send('Email does not match')
                //also check user in Database
            }
            user = await User.findOne({email: email})

        } else if (phone) {

            if (decode_token.phoneemail !== phone) {
                return res.send('Phone does not match')
                //also check user in Database
            }
            user = await User.findOne({phone: phone})
        }

        const otp_instance = await Otp.findById(decode_token.otp_id)

        if (!otp_instance) {
            return res.send('Invalid Otp token given! Plz provide valid token!')
        }
        if (otp_instance.otp !== parseInt(otp) || otp_instance.verified) {

            return res.send('Wrong Otp or Otp have already been verified')
        }
        //check expiration

        if (!(otp_instance.expiration.getTime() > new Date().getTime())) {

            return res.send('Otp has expired')

        }
        otp_instance.verified = true

        await otp_instance.save()

        const userData = {
            email: user.email,
            id: user._id
        }
        const token = jwt.sign(userData, config.jwtsecret)
        res
            .status(200)
            .json({token: token, msg: 'User Logged in Successfully with Otp'})

    } catch (err) {
        console.log(err)
    }

}