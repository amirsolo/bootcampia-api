const AppError = require('../utils/appError')
const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/UserModel')

// Create token, Set cookie and Send response
const sendResponseToken = async (user, statusCode, res) => {
  // Create JWT Access and Refresh Token
  const token = await user.signAccessToken()

  // Cookie options
  const options = {
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days life-time (in Milliseconds)
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
