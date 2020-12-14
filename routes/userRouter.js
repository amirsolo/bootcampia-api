const express = require('express')

const router = express.Router()

// Course model
const User = require('../models/UserModel')

// Course controller methods
const {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser
} = require('../controllers/userController')

// Middlewares
const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')

router.use(protect)
router.use(authorize('admin'))

router.route('/').get(advancedResults(User), getUsers).post(createUser)

router
  .route('/:id')
  .get(getUser)
  .post(createUser)
  .put(updateUser)
  .delete(deleteUser)

module.exports = router
