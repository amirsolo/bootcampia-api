const express = require('express')

const router = express.Router()
const validateInputs = require('../middleware/inputValidation')
// Auth controller methods
const { register, login } = require('../controllers/authController')

router.post('/register', register)

router.post('/login', validateInputs('userLogin'), login)

module.exports = router
