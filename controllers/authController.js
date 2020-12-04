const AppError = require('../utils/appError')
const asyncHandler = require('../middleware/async')
const User = require('../models/UserModel')

// @route     POST /api/v1/auth/register
// @desc      Register a user (Add user to DB & Send JWT token)
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body

  // Check if user already exist
  const doesExist = await User.findOne({ email })
  if (doesExist) return next(new AppError(`Email already exist.`, 400))

  // init a user
  const user = new User({
    name,
    email,
    password,
    role
  })

  // Get JWT Access Token
  const token = await user.getJwtAccessToken()

  // Save the new user to DB
  await user.save()

  return res.status(201).json({ sucess: true, data: { token } })
})

// @route     POST /api/v1/auth/login
// @desc      Login a user (Send JWT token)
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  // Check if user exists
  const user = await User.findOne({ email }).select('+password')
  if (!user) return next(new AppError(`Invalid credentials.`, 401))

  // Check if password is correct
  const isCorrectPassword = await user.matchPassword(password)
  if (!isCorrectPassword) return next(new AppError(`Invalid credentials.`, 401))

  // Get JWT Access Token
  const token = await user.getJwtAccessToken()

  return res.status(200).json({ sucess: true, data: { token } })
})
