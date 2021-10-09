const mongoose = require('mongoose')

const OtpSchema = mongoose.Schema({

    otp:{
        type:Number,
        required:true,
        maxLength:6
    },
    expiration:{
        type:Date,
        isRequired:true
    },
    verified:{
        type:Boolean,
        isRequired:true,
        default:false
    }
}, {timeStamp:true})

const Otp = mongoose.model('Otp', OtpSchema)

module.exports = Otp

