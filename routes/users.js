const express = require('express');
const router = express.Router();
const {signUp,emailPassLogin,updateUserDetails,updatePassword} = require('../controller/userController')
const {verifyUser} = require('../middleware/auth')
const {check} = require('express-validator');


router.post('/signup', [
    check('email').isEmail(),
    check('password').isLength({min: 5})
], signUp)


router.post('/emailpassword/login', [
    check('email').isEmail(),
    check('password').isLength({min: 5})
], emailPassLogin)
    

router.put('/details/:userid', verifyUser, updateUserDetails) //details changes
router.put('/password/:userid', verifyUser, updatePassword) //password changes request

module.exports = router;