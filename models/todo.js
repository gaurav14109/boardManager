const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    },

    status: {
        type: String,
        lowercase: true,
        enum: [
            'todo', 'doing', 'done'
        ], //change will be based on only three if outsider given it will give error.
        default: 'todo'
    }

}, {timestamps: true})

const Todo = mongoose.model('Todo', todoSchema)

module.exports = Todo;