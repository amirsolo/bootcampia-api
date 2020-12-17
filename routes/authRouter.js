const express = require('express')

const router = express.Router()

// Auth controller methods
const {
  register,
  login,
  logout,
  getMe,
  forgotpassword,
  resetpassword,
  updateInfo,
  updatePassword
} = require('../controllers/authController')

// Middlewares
const validateInputs = require('../middleware/inputValidation')
const { protect } = require('../middleware/auth')

router.post('/register', validateInputs('userRegister'), register)

router.post('/login', validateInputs('userLogin'), login)

router.get('/logout', logout)

router.get('/me', protect, getMe)

router.put('/updateinfo', protect, updateInfo)

router.put('/updatepassword', protect, updatePassword)

router.post('/forgotpassword', forgotpassword)

router.put(
  '/resetpassword/:resettoken',
  validateInputs('resetPassword'),
  resetpassword
)

module.exports = router
