const express = require('express')

const router = express.Router()
const Bootcamp = require('../models/BootcampModel')
const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
// Bootcamp controllers
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto,
  deleteBootcampPhoto
} = require('../controllers/bootcampController')

// Include other resource routes
const courseRouter = require('./courseRouter')

// Re-route into other resources
router.use('/:bootcampId/courses', courseRouter)

// Upload & Delete bootcamp photo
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), uploadBootcampPhoto)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcampPhoto)

// Get bootcamps within the given radius
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

module.exports = router
