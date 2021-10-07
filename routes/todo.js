const express = require('express');
const router = express.Router();
const {verifyUser} = require('../middleware/auth')
const {createNewTodo,updateTodo,getTodoById,deleteTodoById} = require('../controller/todoController')

router.get('/:todoId', getTodoById)
router.post('/createTodo/:boardId', verifyUser, createNewTodo)
router.put('/updateTodo/:todoId', verifyUser, updateTodo)
router.delete('/deleteTodo/:todoId/:boardId', verifyUser, deleteTodoById)


module.exports = router