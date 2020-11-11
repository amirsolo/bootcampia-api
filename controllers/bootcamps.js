const AppError = require('../utils/appError')
const Bootcamp = require('../models/Bootcamp')
const geocoder = require('../utils/geocoder')
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

// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @desc      Get bootcamps within a spicific distance
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  // Get zipcode and distance form params
  const { zipcode, distance } = req.params

  // Get zipcode coordinates (let, long)
  const [loc] = await geocoder.geocode(zipcode)
  const lat = loc.latitude
  const lng = loc.longitude

  // calculate circle radius measured in radians
  // devide distance by earth raduis (6,371 km, 3,959 m)
  // More Info: https://stackoverflow.com/questions/12180290/convert-kilometers-to-radians
  const radius = distance / 3959

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  })

  return res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps })
})
