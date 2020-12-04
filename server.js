const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan')
const fileupload = require('express-fileupload')
require('colors')
const connectDB = require('./config/db')
const globalErrorHandler = require('./middleware/errorHandler')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Connect to the database
connectDB()

const app = express()

// Route files
const bootcampRouter = require('./routes/bootcampRouter')
const courseRouter = require('./routes/courseRouter')
const authRouter = require('./routes/authRouter')

// JSON body parser middleware
app.use(express.json())

// File upload
app.use(fileupload())

// Logging middleware (Only in Dev environment)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Mount routes
app.get('/', (req, res, next) => {
  res.send('Server is running & API is working')
})
app.use('/api/v1/bootcamps', bootcampRouter)
app.use('/api/v1/courses', courseRouter)
app.use('/api/v1/auth', authRouter)

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
