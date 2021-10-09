const Board = require('../models/boardManager')
const User = require('../models/user')
const Todo = require('../models/todo')
module.exports.createNewTodo = async (req, res) => {
    const boardId = req.params.boardId
    try {
        const userEmail = req.user.email

        const user = await User.findOne({email: userEmail})
        if (!user) {

            return res.send('No Such User!')
        }

        const board = await Board.findById(boardId)

        if (!board) {
            return res.send('No Such Board!')
        }

        if (!(board.user == req.user.id)) {
            return res.send('Board not created by user! ')
        }
        const {name, status} = req.body
        const todolist = {}
        if (status && name) {
            todolist.name = name,
            todolist.status = status,
            todolist.user = user._id
            todolist.board = board._id
        } else {
            todolist.name = name;
            todolist.user = user._id
            todolist.board = board._id
        }

        const todo = await new Todo(todolist)

        await todo.save()

        board
            .todoLists
            .push(todo)

        board.save()

        res.send('Todo created successfully!');
    } catch (err) {
        console.log(err)
    }
}

/*Update Todo List*/
module.exports.updateTodo = async (req, res) => {

    try {
        const todoId = req.params.todoId;

        const todo = await Todo.findById(todoId)
        if (!todo) {
            return res.send('No Such Todo in Board List')
        }

        if (!(todo.user == req.user.id)) {
            return res.send('Not Authorized')
        }

        const {name, status} = req.body;

        todo.name = name;
        todo.status = status;

        await todo.save()

        res.send('TodoList Updated successfully')

    } catch (err) {
        console.log(err)
    }
}

/*get Todo by id*/
module.exports.getTodoById = async (req, res) => {

    try {
        const todoId = req.params.todoId;
        const todo = await Todo.findById(todoId)

        if (!todo) {
            return res.send('No Such todo')
        }

        res.json(todo)

    } catch (err) {
        console.log(err)
    }
}

/*get Todo by id*/
module.exports.deleteTodoById = async (req, res) => {

    try {
        const boardId = req.params.boardId;
        const todoId = req.params.todoId;

        const board = await Board.findById(boardId)
        if (!board) {

            return res.send('No Such Board Have Todolist')
        }
        if (!(board.user == req.user.id)) {

            return res.send('Not authorized to delete')
        }
        const index = board
            .todoLists
            .indexOf(todoId)
        if (index === -1) {
            return res.send('No Such List in Board')
        }
        board
            .todoLists
            .splice(index, 1)
        await board.save()
        await Todo.findOneAndDelete({_id: todoId})

        res.send('deletion successful')

    } catch (err) {
        console.log(err)
    }
}
