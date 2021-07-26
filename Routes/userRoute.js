const userController = require('../Controllers/userController')
const authenticate = require('../MiddleWares/authenticate')

// Initializing express router
const express = require('express');
const user = express.Router()
user.get('/create', userController.createDB)
user.post('/register', userController.register)
user.post('/login', userController.login)
user.post('/addMoney', authenticate, userController.addMoney)
user.post('/sendMoney', authenticate, userController.sendMoney)
user.post('/delete', authenticate, userController.deleteUser)


module.exports = user