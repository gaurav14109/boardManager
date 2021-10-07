const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const AVATAR_PATH = path.join('/uploads/users/avatars');
const UserSchema = mongoose.Schema({

    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        maxLength: 15
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    }

}, {timestamps: true})

UserSchema
    .virtual('password')
    //will send passeword to function
    .set(function (password) {

        this._password = password;
        this.salt = uuidv4();

        this.hashed_password = this.generateHashedPassword(password);

    })

UserSchema.methods = {

    authenticate: function (plainText) {

        return (this.generateHashedPassword(plainText) === this.hashed_password)
    },
    generateHashedPassword: function (password) {

        if (!password) 
            return '';
        try {

            return crypto
                .createHmac('sha256', this.salt)
                .update(password)
                .digest('hex')

        } catch (err) {

            console.log(err)
            return "";

        }

    },

    generateUpdatePassword: function (newPassword) {

        if (!newPassword) 
            return '';
        try {
            this.hashed_password = crypto
                .createHmac('sha256', this.salt)
                .update(newPassword)
                .digest('hex')
            return true

        } catch (err) {

            console.log(err)
            return "";

        }
    }
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', AVATAR_PATH));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});

// static method
UserSchema.statics.uploadedAvatar = multer({storage: storage}).single('avatar');
UserSchema.statics.avatarPath = AVATAR_PATH;

const User = mongoose.model('User', UserSchema)
module.exports = User;