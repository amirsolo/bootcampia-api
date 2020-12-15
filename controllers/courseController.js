const AppError = require('../utils/appError')
const asyncHandler = require('../middleware/asyncHandler')
const Course = require('../models/CourseModel')
const Bootcamp = require('../models/BootcampModel')

// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @desc      Get courses (Either all or for a spicific bootcamp)
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    // Get courses for a specific bootcamp
    const courses = await Course.find({ bootcamp: req.params.bootcampId })
    return res.status(200).json({
      sucess: true,
      count: courses.length,
      data: courses
    })
  }

  // Get all courses
  return res.status(200).json(res.advancedResults)
})

// @route     GET /api/v1/courses/:id
// @desc      Get single course
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  // If resource doesn't exist in DB
  if (!course) {
    return next(
      new AppError(`Course not found with id of ${req.params.id}`, 404)
    )
  }

  return res.status(200).json({
    sucess: true,
    data: course
  })
})

// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @desc      Add a course
// @access    Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  // If bootcamp doesn't exist
  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp not found with id of ${req.params.bootcampId}`,
        404
      )
    )
  }

  // Makue sure user is bootcamp owner
  if (req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin') {
    return next(new AppError(`Not authorized to commit this action.`, 403))
  }

  // Set fields
  const fields = {
    title: req.body.title,
    description: req.body.description,
    weeks: req.body.weeks,
    tuition: req.body.tuition,
    minimumSkill: req.body.minimumSkill,
    scholrashipAvailable: req.body.scholrashipAvailable || false,
    bootcamp: req.params.bootcampId,
    user: req.user.id
  }

  // Create course
  const course = await Course.create(fields)

  return res.status(201).json({
    sucess: true,
    data: course
  })
})

// @route     PUT /api/v1/courses/:id
// @desc      Updata course by ID
// @access    Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id)

  // if the course doesn't exist
  if (!course) {
    return next(
      new AppError(`Course not found with id of ${req.params.id}`, 404)
    )
  }

  // Makue sure user is bootcamp owner
  if (req.user.id !== course.user.toString() && req.user.role !== 'admin') {
    return next(new AppError(`Not authorized to commit this action.`, 403))
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  return res.status(200).json({
    sucess: true,
    data: course
  })
})

// @route     DELETE /api/v1/courses/:id
// @desc      Delete a course by id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return next(
      new AppError(`Course not found with id of ${req.params.id}`, 404)
    )
  }

  await course.remove()

  return res.status(200).json({
    sucess: true,
    data: { message: 'Course Deleted Successfully.' }
  })
})
