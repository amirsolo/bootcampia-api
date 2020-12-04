const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')

const UserSchema = new Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [30, 'name can not be more than 30 characters long.'],
    required: [true, 'name is required']
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'email is not valid']
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 8,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Hash password before save
UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  return next()
})

// Sign Jwt and return (Async)
UserSchema.methods.getJwtAccessToken = function () {
  return new Promise((resolve, reject) => {
    const payload = {
      userId: this._id
    }
    const jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET
    const options = {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE
    }

    jwt.sign(payload, jwtSecret, options, (err, token) => {
      if (err) {
        console.log(err)
        return reject(new AppError(`Internal Server Error!`, 500))
      }

      return resolve(token)
    })
  })
}

module.exports = model('User', UserSchema)
