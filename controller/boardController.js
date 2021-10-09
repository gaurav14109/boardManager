const Board = require('../models/boardManager')
const Todo = require('../models/todo')
const User = require('../models/user')
module.exports.createNewBoard = async (req, res) => {

    try {
        const userEmail = req.user.email

        const user = await User.findOne({email: userEmail})
        if (!user) {

            return res.send('No Such User!')
        }
        const {name} = req.body;
        const board = {
            name: name,
            user: user._id
        }
        await new Board(board).save();

        res.send('Board created successfully!');
    } catch (err) {
        console.log(err)
    }
}

/* Get all board with todolist */
module.exports.getBoards = async (req, res) => {

    try {
        const Boards = await Board
            .find()
            .populate('todoLists', '_id name status user')

        res.json(Boards)
    } catch (err) {

        console.log(err)
    }

}

/* Get all board with todolist */
module.exports.deleteBoard = async (req, res) => {

    try {
        const boardId = req.params.boardId
        const board = await Board.findById(boardId)

        if (!board) {
            return res.send('No Such Board exists! ')
        }

        board.remove()
        await Todo.deleteMany({board: boardId});

        res.send('Deleted Successfully')
    } catch (err) {

        console.log(err)
    }

}