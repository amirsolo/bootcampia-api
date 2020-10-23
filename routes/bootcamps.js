const express = require('express')

const router = express.Router()
// Bootcamp controllers
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp
} = require('../controllers/bootcamps')

// Get all bootcamps + Post bootcamp
router.route('/').get(getBootcamps).post(createBootcamp)

// Get one bootcamp + Update bootcamp + delete bootcamp
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

module.exports = router
