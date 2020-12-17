const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const fileupload = require('express-fileupload')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const helment = require('helmet')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')
require('colors')
const connectDB = require('./config/db')
const globalErrorHandler = require('./middleware/errorHandler')
const AppError = require('./utils/appError')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Connect to the database
connectDB()

const app = express()

// Route files
const bootcampRouter = require('./routes/bootcampRouter')
const courseRouter = require('./routes/courseRouter')
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const reviewRouter = require('./routes/reviewRouter')

// Enable CORS
app.use(cors({ credentials: true }))

// JSON body parser middleware
app.use((req, res, next) => {
  express.json()(req, res, (err) => {
    // Handle error in case of JSON parsing issues
    if (
      err &&
      err instanceof SyntaxError &&
      err.status === 400 &&
      err.type === 'entity.parse.failed'
    ) {
      return next(new AppError(`Invalid JSON format: ${err.message}`, 400))
    }

    return next()
  })
})

// Cookie Parser
app.use(cookieParser())

// File upload
app.use(fileupload())

// Sanatize Data (Against NoSQL injection)
app.use(mongoSanitize())

// Sanitize Data (Agains XSS attack)
app.use(xss())

// Set extra security headers
app.use(helment())

// Protection against HTTP Parameter Pollution attacks
app.use(hpp())

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 200,
  message: {
    sucess: false,
    data: { msg: 'Too many requests, please try again later.' }
  }
})
// apply to all requests
app.use(limiter)

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
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

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
