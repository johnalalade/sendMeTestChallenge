var express = require('express');
var bodyParser = require('body-parser');
require('dotenv').config()

const userRoute = require('./Routes/userRoute')
// Initialize express server
const app = express()

// Setting Port
const port = process.env.PORT || 5000

// MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// Using Routes
app.use('/', userRoute)

// Serving
app.listen(port, function(){
    console.log(`Server started on port ${port}`)
})