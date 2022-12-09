const express = require('express')
const { verifyToken, isAdmin } = require('../Middleware/verifyToken')
const router = express.Router()

const userController = require('./../Controllers/userController')

router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)

//Verify token
router.get('/token', userController.validateToken)

//Admin side
router.get('/', userController.showAllUser)
router.get('/:id', verifyToken, isAdmin, userController.getUserById)
router.get('/search/:keyword', verifyToken, isAdmin, userController.searchUser)
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser)

//Test railway
router.get('/railway', userController.showAllUser)

//Customer side
router.put('/update/:id', verifyToken, userController.updateUser)

module.exports = router
