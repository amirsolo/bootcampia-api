const express = require('express')

const router = express.Router({ mergeParams: true })

// Course model
const Review = require('../models/ReviewModel')

// Course controller methods
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController')

// Middlewares
const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview)

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router
