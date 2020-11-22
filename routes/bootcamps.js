const express = require('express')

const router = express.Router()
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
} = require('../controllers/bootcamps')

// Include other resource routes
const courseRouter = require('./courses')

// Re-route into other resources
router.use('/:bootcampId/courses', courseRouter)

// Upload bootcamp photo
router.route('/:id/photo').put(uploadBootcampPhoto).delete(deleteBootcampPhoto)

// Get bootcamps within the given radius
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

// Get all bootcamps + Post bootcamp
router.route('/').get(getBootcamps).post(createBootcamp)

// Get one bootcamp + Update bootcamp + delete bootcamp
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

module.exports = router
