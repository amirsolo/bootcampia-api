const AppError = require('../utils/appError')
const asyncHandler = require('../middleware/asyncHandler')
const Review = require('../models/ReviewModel')
const Bootcamp = require('../models/BootcampModel')

// @route     GET /api/v1/review
// @route     GET /api/v1/bootcamps/:bootcampId/reviews
// @desc      Get reviews (Either all or for a spicific bootcamp)
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    // Get reviews for a specific bootcamp
    const reviews = await Review.find({ bootcamp: req.params.bootcampId })
    return res.status(200).json({
      sucess: true,
      count: reviews.length,
      data: reviews
    })
  }

  // Get all reviews
  return res.status(200).json(res.advancedResults)
})

// @route     GET /api/v1/reviews/:id
// @desc      Get single review
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  // If resource doesn't exist in DB
  if (!review) {
    return next(
      new AppError(`review not found with id of ${req.params.id}`, 404)
    )
  }

  return res.status(200).json({
    sucess: true,
    data: review
  })
})

// @route     POST /api/v1/bootcamps/:bootcampId/reviews
// @desc      Add a review
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
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

  // Prevent users from submitting more than one review per bootcamp
  const review = await Review.findOne({
    user: req.user.id,
    bootcamp: req.params.bootcampId
  })
  if (review) {
    return next(
      new AppError(
        `user id: ${req.user.id} has already left a review on this bootcamp.`,
        400
      )
    )
  }

  // set new review fields
  const reviewFields = {
    title: req.body.title,
    text: req.body.text,
    rating: Math.round(req.body.rating),
    user: req.user.id,
    bootcamp: req.params.bootcampId
  }

  // create a review
  const newReview = await Review.create(reviewFields)

  return res.status(201).json({
    sucess: true,
    data: newReview
  })
})

// @route     PUT /api/v1/reviews/:id
// @desc      Updata Review
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id)

  // if the course doesn't exist
  if (!review) {
    return next(
      new AppError(`Review not found with id of ${req.params.id}`, 404)
    )
  }

  // Makue sure user is the review owner (admin is allowed)
  if (req.user.id !== review.user.toString() && req.user.role !== 'admin') {
    return next(new AppError(`Not authorized to commit this action.`, 401))
  }

  // Fields to update
  const fieldsToUpdate = {
    title: req.body.title || review.title,
    text: req.body.text || review.text,
    rating: Math.round(req.body.rating) || review.rating
  }

  review = await Review.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  })

  return res.status(200).json({
    sucess: true,
    data: review
  })
})

// @route     DELETE /api/v1/reviews/:id
// @desc      Delete a review
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return next(
      new AppError(`Review not found with id of ${req.params.id}`, 404)
    )
  }

  // Makue sure user is the review owner (admin is allowed)
  if (req.user.id !== review.user.toString() && req.user.role !== 'admin') {
    return next(new AppError(`Not authorized to commit this action.`, 401))
  }

  await review.remove()

  return res.status(200).json({
    sucess: true,
    data: { message: 'Review Deleted Successfully.' }
  })
})
