const mongoose = require('mongoose')

async function connectDB() {
  const conn = await mongoose.connect(encodeURI(process.env.MONGO_URI), {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  console.log(`MongoDB connected: ${conn.connection.host}`.blue.underline)

  process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
  })
}

module.exports = connectDB
