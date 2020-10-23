const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
require('colors')
const connectDB = require('./config/db')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Connect to the database
connectDB()

const app = express()

// Route files
const bootcamps = require('./routes/bootcamps')

// Logging middleware (Only in Dev environment)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Mount routes
app.use('/api/v1/bootcamps', bootcamps)

const PORT = process.env.PORT || 3004
const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue
  )
)

// Handle "Unhandled promise rejections"
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold)

  // Close server and exit process (1: with failure)
  server.close(() => process.exit(1))
})
