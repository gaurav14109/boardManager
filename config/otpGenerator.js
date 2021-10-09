var otpGenerator = require('otp-generator');
module.exports.otpGenerator = ()=>{
const otp = otpGenerator.generate(6, {
    alphabets: false,
    upperCase: false,
    specialChars: false
})
return otp;
}