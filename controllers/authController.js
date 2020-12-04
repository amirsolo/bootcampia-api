const AppError = require('../utils/appError')
const asyncHandler = require('../middleware/async')
const User = require('../models/UserModel')

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
