const { body, validationResult } = require('express-validator')
const UserValidationError = require('../utils/userValidationError')

const validateInput = (method) => {
  let validationChain

  // Apply different validators based on the given method
  switch (method) {
    case 'userLogin':
      validationChain = [
        body('email', 'email is not valid.').trim().isEmail(),
        body(
          'password',
          'password must be between 8 to 64 characters.'
        ).isLength({ min: 8, max: 64 })
      ]
      break
    case 'userRegister':
      validationChain = [
        body('name', 'name can not be more than 30 characters long')
          .isLength({
            max: 30
          })
          .trim(),
        body('email', 'email is not valid.').trim().isEmail(),
        body(
          'password',
          'password must be between 8 to 64 characters.'
        ).isLength({ min: 8, max: 64 })
      ]
      break
    case 'resetPassword':
      validationChain = [
        body(
          'password',
          'password must be between 8 to 64 characters.'
        ).isLength({ min: 8, max: 64 })
      ]
      break
    default:
      return []
  }

  const handleErrors = (req, res, next) => {
    let errors = validationResult(req)
    if (errors.isEmpty()) return next()

    // Format errors
    errors = errors.array().map((err) => err.msg)
    return next(new UserValidationError('Invalid data', 400, errors))
  }

  return [validationChain, handleErrors].flat()
}

module.exports = validateInput
