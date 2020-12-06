const express = require('express')

const router = express.Router({ mergeParams: true })
const Course = require('../models/CourseModel')
const { protect } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
// Course controller methods
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController')

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getCourses
  )
  .post(protect, addCourse)

router
  .route('/:id')
  .get(getCourse)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse)

module.exports = router
