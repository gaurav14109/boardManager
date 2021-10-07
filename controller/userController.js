const User = require('../models/user')
const {validationResult} = require('express-validator');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config')
const fs = require('fs');
const path = require('path');

module.exports.signUp = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({errors: errors.array()});
    }
    try {
        const user = await User.findOne({email: req.body.email})

        if (user) {
            return res.send('User Already Registered')
        }

        const whitelist = ['name', 'email', 'password', 'phone']
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
                        console.log(user.avatar)
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

// Todo-task login through otp using phone