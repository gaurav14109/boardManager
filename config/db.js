const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/BoardMaster')

const db = mongoose
    .connection

    db
    .on('error', console.error.bind(console, "Error connecting to MongoDB"));

db.once('open', function () {
    console.log('Connected to Database :: MongoDB');
});
//once means it will be called only once when event occurs
module.exports = db;