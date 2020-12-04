const express = require('express')

const router = express.Router({ mergeParams: true })
const Course = require('../models/CourseModel')
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
  .post(addCourse)

router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

module.exports = router
