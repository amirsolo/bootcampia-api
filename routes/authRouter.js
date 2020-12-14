const express = require('express')

const router = express.Router()
const validateInputs = require('../middleware/inputValidation')
const { protect } = require('../middleware/auth')
// Auth controller methods
const {
  register,
  login,
  getMe,
  forgotpassword,
  resetpassword
} = require('../controllers/authController')

router.post('/register', validateInputs('userRegister'), register)

router.post('/login', validateInputs('userLogin'), login)

router.get('/me', protect, getMe)

router.post('/forgotpassword', forgotpassword)

router.put(
  '/resetpassword/:resettoken',
  validateInputs('resetPassword'),
  resetpassword
)

module.exports = router
