const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
require('colors')
const connectDB = require('./config/db')
const globalErrorHandler = require('./middleware/error')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Connect to the database
connectDB()

const app = express()

// Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')

// JSON body parser middleware
app.use(express.json())

// Logging middleware (Only in Dev environment)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Mount routes
app.get('/', (req, res, next) => {
  res.send('Server is running & API is working')
})
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)

// Error Handler middleware
app.use(globalErrorHandler)

const PORT = process.env.PORT || 3004
const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue
  )
)

// Handle "Unhandled promise rejections"
process.on('unhandledRejection', (err, promise) => {
  console.log(`${err.name}: ${err.message}`.red)
  console.log('Unhandled Rejection! Sutting down...'.red)

  // Close server and exit process (1: with failure)
  server.close(() => process.exit(1))
})

// Handle "Uncaught Exceptions" errors
process.on('uncaughtException', (err, promise) => {
  console.log(`${err.name}: ${err.message}`.red)
  console.log('ncaught Exceptions! Sutting down...'.red)

  // Close server and exit process (1: with failure)
  server.close(() => process.exit(1))
})
