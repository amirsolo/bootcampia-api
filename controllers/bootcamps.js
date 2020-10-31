const AppError = require('../utils/appError')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')

// @route     GET /api/v1/bootcamps
// @desc      Get all bootcamps
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find()

  return res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps })
})

// @route     GET /api/v1/bootcamps/:id
// @desc      Get single bootcamp with the given id
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  // If bootcamp doesn't exist in DB
  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  return res.status(200).json({ success: true, data: bootcamp })
})

// @route     POST /api/v1/bootcamps
// @desc      Create a bootcamp
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body)

  return res.status(200).json({ success: true, data: bootcamp })
})

// @route     PUT /api/v1/bootcamps/:id
// @desc      Update single bootcamp with the given id
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!bootcamp) {
    return res.status(400).json({ success: false })
  }

  return res.status(200).json({ success: true, data: bootcamp })
})

// @route     DELETE /api/v1/bootcamps/:id
// @desc      Delete Single bootcamp with the given id
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

  if (!bootcamp) {
    return res.status(400).json({ success: false })
  }

  return res.status(200).json({ success: true, data: {} })
})
