/*
    Will have a board manager of particular user

    Board will have user who have created the board, and todolist in the board
    board will have todolists array of objects

*/
const mongoose = require('mongoose');

const BoardSchema = mongoose.Schema({

    name:{
        type:String,
        required:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },

    todoLists:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Todo'
        }
    ]
},{timestamps: true})

const Board = mongoose.model('Board',BoardSchema)

module.exports = Board;