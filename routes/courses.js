const express = require('express')

const router = express.Router({ mergeParams: true })

// Course controller methods
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses')

router.route('/').get(getCourses).post(addCourse)

router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

module.exports = router
