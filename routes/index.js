const express = require('express');
const router = express.Router();
const userRouter = require('./users');
const boardRouter = require('./boardManager')
const todoRouter = require('./todo')

router.use('/api/user', userRouter);
router.use('/api/board', boardRouter);
router.use('/api/board/todo', todoRouter);
module.exports = router;