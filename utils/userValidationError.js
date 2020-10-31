const AppError = require('./appError')

class UserValidationError extends AppError {
  constructor(message = 'Invalid data', statusCode, errorArray) {
    super(message, statusCode)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.success = false
    this.errors = errorArray // Error array
    this.isOperational = true
    this.isUserValidation = true

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = UserValidationError
