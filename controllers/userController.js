// const AppError = require('../utils/appError')
const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/UserModel')
const AppError = require('../utils/appError')

// @route     GET /api/v1/users
// @desc      Get all users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  return res.status(200).json(res.advancedResults)
})

// @route     GET /api/v1/users/:id
// @desc      Get single user (by id)
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) return next(new AppError('No user found with this ID', 404))

  return res.status(200).json({
    sucess: true,
    data: user
  })
})

// @route     POST /api/v1/users
// @desc      Create user
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body)

  return res.status(201).json({
    sucess: true,
    data: user
  })
})

// @route     PUT /api/v1/users/:id
// @desc      Update user
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!user) return next(new AppError('No user found with this ID', 404))

  return res.status(200).json({
    sucess: true,
    data: user
  })
})

// @route     DELETE /api/v1/users/:id
// @desc      Delete a user
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) return next(new AppError('No user found with this ID', 404))

  await user.remove()

  return res.status(200).json({
    sucess: true,
    data: { msg: 'User deleted successfully' }
  })
})
