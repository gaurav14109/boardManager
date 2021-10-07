const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./config/db')
const port = process.env.PORT || 8980;

app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
app.use('/', require('./routes'));
//converting Json-string to a Javascript object, reading req.body content when sending multiplart use formdata
//and not in req.body
app.listen(port,(err)=>{

    if(err){
        console.log('Error starting Server')
    }
    console.log(`Started on port: ${port}`)
})

//controller means where req is handled.