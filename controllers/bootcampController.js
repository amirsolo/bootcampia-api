const path = require('path')
const fs = require('fs')
const AppError = require('../utils/appError')
const Bootcamp = require('../models/BootcampModel')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('../middleware/asyncHandler')

// @route     GET /api/v1/bootcamps
// @desc      Get all bootcamps
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  return res.status(200).json(res.advancedResults)
})

// @route     GET /api/v1/bootcamps/:id
// @desc      Get single bootcamp with the given id
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id).populate({
    path: 'courses',
    select: 'title description'
  })

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

  return res.status(201).json({ success: true, data: bootcamp })
})

// @route     PUT /api/v1/bootcamps/:id
// @desc      Update single bootcamp with the given id
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  // If bootcamp doesn't exist in DB
  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  return res.status(200).json({ success: true, data: bootcamp })
})

// @route     DELETE /api/v1/bootcamps/:id
// @desc      Delete Single bootcamp with the given id
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  // If bootcamp doesn't exist in DB
  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  // Delete bootcamp
  await bootcamp.remove()

  return res.status(200).json({
    success: true,
    data: { message: 'Bootcamp Deleted Successfully.' }
  })
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

// @route     PUT /api/v1/bootcamps/:id/photo
// @desc      Upload bootcamp photo
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  // If bootcamp doesn't exist in DB
  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  // Check if a file is uploaded
  if (!req.files) {
    return next(new AppError(`No file was uploaded.`, 400))
  }
  // Make sure the file is being uploaded by the key "file"
  if (!req.files.file) {
    return next(new AppError(`No file was uploaded.`, 400))
  }

  const { file } = req.files

  // Check if Its an image
  if (!file.mimetype.startsWith('image')) {
    return next(new AppError(`File must be an image`, 400))
  }

  // Check the size of the image
  if (file.size > process.env.IMAGE_UPLOAD_MAX) {
    const sizeInKB = `${Math.floor(process.env.IMAGE_UPLOAD_MAX / 1000)} KB`
    return next(new AppError(`File cannot be more than ${sizeInKB}`, 400))
  }

  // Create custom filename
  file.name = `bootcampPhoto_${bootcamp._id}${path.parse(file.name).ext}`

  // Move(Save) file to image folder
  const photoPath = `${process.env.IMAGE_UPLOAD_PATH}/${file.name}`
  return file.mv(photoPath, async (err) => {
    if (err) {
      console.error('Problem with uploading bootcamp photo: ', err)
      return next(
        new AppError(`Something went wrong with uploading the photo`, 500)
      )
    }

    // Update bootcamp photo filed in DB
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

    return res.status(200).json({
      success: true,
      data: {
        file_name: file.name
      }
    })
  })
})

// @route     DELETE /api/v1/bootcamps/:id/photo
// @desc      Delete bootcamp photo
exports.deleteBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  // If bootcamp doesn't exist in DB
  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  // if there is no photo for the bootcamp
  if (bootcamp.photo === 'no-photo.jpg') {
    return next(new AppError(`No photo found for this bootcamp`, 404))
  }

  const photoPath = `${process.env.IMAGE_UPLOAD_PATH}/${bootcamp.photo}`
  return fs.unlink(photoPath, async (err) => {
    if (err) {
      console.error('Problem with deleting bootcamp photo: ', err)
      return next(
        new AppError(`Something went wrong with deleting the photo`, 500)
      )
    }

    // Update bootcamp in DB
    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: 'no-photo.jpg'
    })

    return res.status(200).json({
      success: true,
      data: {
        message: 'Photo deleted successfully.'
      }
    })
  })
})
