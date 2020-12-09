const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const User = require('../models/UserModel')
const asyncHandler = require('./asyncHandler')

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token

  // Extract token from either authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  // Check if there is a token
  if (!token)
    return next(new AppError('Not Authorized To Access This Route', 401))

  // Verify the token
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    asyncHandler(async (err, payload) => {
      // If token is not valid
      if (err)
        return next(new AppError('Not Authorized To Access This Route', 401))

      const user = await User.findById(payload.userId)
      if (!user)
        return next(new AppError('Not Authorized To Access This Route', 401))

      // Attach the authorized user to req
      req.user = user

      return next()
    })
  )
})

// Role Authorization
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `User role [${req.user.role}] is not authorized to access this route`,
        403
      )
    )
  }
  return next()
}
