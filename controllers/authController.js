const crypto = require('crypto')
const AppError = require('../utils/appError')
const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/UserModel')
const sendEmail = require('../utils/sendEmail')

// Create token, Set cookie and Send response
const sendResponseToken = async (user, statusCode, res) => {
  // Create JWT Access and Refresh Token
  const token = await user.signAccessToken()

  // Cookie options
  const options = {
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRE, 10), // 14 days life-time (in Milliseconds)
    httpOnly: true
  }

  // Set secure option only in production mode
  if (process.env.NODE_ENV === 'production') options.secure = true

  return res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ sucess: true, data: { token } })
}

// @route     POST /api/v1/auth/register
// @desc      Register a user (Add user to DB & Send JWT token)
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body

  // Check if user already exist
  const doesExist = await User.findOne({ email })
  if (doesExist) return next(new AppError(`Email already exist.`, 400))

  // init a user
  const user = await User.create({
    name,
    email,
    password,
    role
  })

  return sendResponseToken(user, 201, res)
})

// @route     POST /api/v1/auth/login
// @desc      Login a user (Send JWT token)
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  // Check if user exists
  const user = await User.findOne({ email }).select('+password')
  if (!user) return next(new AppError(`Invalid credentials.`, 401))

  // Check if password is correct
  const isCorrectPassword = await user.matchPassword(password)
  if (!isCorrectPassword) return next(new AppError(`Invalid credentials.`, 401))

  return sendResponseToken(user, 200, res)
})

// @route     GET /api/v1/auth/me
// @desc      Get currently logged in user's info
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  return res.status(200).json({ sucess: true, data: user })
})

// @route     GET /api/v1/auth/updateinfo
// @desc      Update logged in user's info
// @access    Private
exports.updateInfo = asyncHandler(async (req, res, next) => {
  const filedsToUpdate = {
    name: req.body.name
  }

  const user = await User.findByIdAndUpdate(req.user.id, filedsToUpdate, {
    new: true,
    runValidators: true
  })

  return res.status(200).json({ sucess: true, data: user })
})

// @route     GET /api/v1/auth/updatepassword
// @desc      Update logged in user's password
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user.id).select('+password')

  // Check to see if current password is correct
  if (!(await user.matchPassword(currentPassword)))
    return next(new AppError('Invalid current password.', 401))

  // Update user password
  user.password = newPassword
  await user.save()

  return sendResponseToken(user, 200, res)
})

// @route     POST /api/v1/auth/forgotpassword
// @desc      Forgot password
// @access    Public
exports.forgotpassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user)
    return next(new AppError(`No user found with the this email.`, 404))

  const resetToken = await user.getResetPasswordToken()

  // Save token in DB
  await user.save({ validateBeforeSave: false })

  const baseURL = `${req.protocol}://${req.get('host')}`
  const resetURL = `${baseURL}/api/v1/auth/resetpassword/${resetToken}`

  const message = `Your are receiving this email because you (or someone else) has requested to reset your account's password. Please make a put request to this url: \n\n ${resetURL}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Password',
      message
    })
    return res.status(200).json({ sucess: true, data: { msg: 'Email sent' } })
  } catch (error) {
    console.log(error)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new AppError('Email could not be sent', 500))
  }
})

// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @desc      Reset password via token
// @access    Public
exports.resetpassword = asyncHandler(async (req, res, next) => {
  const resetToken = req.params.resettoken

  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // Get user
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) return next(new AppError('Invalid Token.', 400))

  // Set new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  return sendResponseToken(user, 200, res)
})
