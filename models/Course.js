const { Schema, model } = require('mongoose')

const courseSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  weeks: {
    type: Number,
    required: [true, 'Number of weeks is required']
  },
  tuition: {
    type: Number,
    required: [true, 'Tuition cost is required']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Minimus skill is required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholrashipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
})

module.exports = model('Course', courseSchema)
