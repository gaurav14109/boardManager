const express = require('express');
const router = express.Router();
const {verifyUser} = require('../middleware/auth')
const {createNewBoard,getBoards,deleteBoard} = require('../controller/boardController')

router.get('/' ,getBoards)
router.post('/createboard', verifyUser ,createNewBoard )
router.delete('/deleteboard/:boardId', verifyUser ,deleteBoard )

module.exports = router