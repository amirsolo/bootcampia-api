const express = require('express')

const router = express.Router()
const validateInputs = require('../middleware/inputValidation')
const { protect } = require('../middleware/auth')
// Auth controller methods
const { register, login, getMe } = require('../controllers/authController')

router.post('/register', register)

router.post('/login', validateInputs('userLogin'), login)

router.get('/me', protect, getMe)

module.exports = router
