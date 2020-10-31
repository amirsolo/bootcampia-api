const mongoose = require('mongoose')
const AppError = require('../utils/appError')
const UserValidationError = require('../utils/userValidationError')

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)
  const message = `Duplicate field value: '${value[0]}', Please use another value`
  return new AppError(message, 400)
}

const handeValidationErrorDB = (err) => {
  // Create arraya of error messages
  const errors = Object.values(err.errors).map((errItem) => errItem.message)
  return new UserValidationError('Invalid data', 400, errors)
}

// Send AppError
const sendAppError = (err, res) => {
  return res.status(err.statusCode).json({
    success: false,
    status: err.status,
    statusCode: err.statusCode,
    message: err.message
  })
}

// Send UserValidationError
const sendUserValidationError = (err, res) => {
  return res.status(err.statusCode).json({
    success: false,
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
    errors: err.errors
  })
}

const handleErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    error: err,
    stack: err.stack
  })
}

const handleErrorProd = (err, res) => {
  // Operational & trusted errors : send message to client
  if (err.isOperational) {
    // Handle sending UserValidatinError
    if (err.isUserValidation) {
      return sendUserValidationError(err, res)
    }
    // Handle sending regular AppError
    return sendAppError(err, res)
  }

  // Programming or other Unknown errors: Log to console + Send generic message
  console.log(`${err}`.red.bold)

  return res.status(500).json({
    success: false,
    status: 'error',
    statusCode: 500,
    message: 'Internal Server Error!'
  })
}

const globalErrorHandler = (err, req, res, next) => {
  // Create hard copy of err object
  let error = { ...err }
  error.message = err.message
  error.status = err.status || 'error'
  error.statusCode = err.statusCode || 500

  // Handle error in development mode
  if (process.env.NODE_ENV === 'development') {
    return handleErrorDev(error, res)
  }

  // Mongoose fails to cast a value (e.g. invalid ObjectID)
  if (err instanceof mongoose.Error.CastError) error = handleCastErrorDB(err)
  // Mongoose Duplicate key error
  if (err.name === 'MongoError' && err.code === 11000)
    error = handleDuplicateFieldsDB(err)
  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError)
    error = handeValidationErrorDB(err)

  // Handle error in production mode
  return handleErrorProd(error, res)
}

module.exports = globalErrorHandler
