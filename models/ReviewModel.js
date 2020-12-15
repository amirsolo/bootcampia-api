const { Schema, model } = require('mongoose')

const ReviewSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'title is required']
  },
  text: {
    type: String,
    required: [true, 'text is required'],
    maxlength: [1000, 'review can not be more than 1000 characters long.']
  },
  rating: {
    type: Number,
    min: [1, 'rating must be between 1-10'],
    max: [10, 'rating must be between 1-10'],
    required: [true, 'rating is required.']
  },
  bootcamp: {
    type: Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Prevent users from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

// Get averageRating of bootcamp (Using Aggregation)
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const res = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageRating: { $avg: '$rating' } } }
  ])

  try {
    if (res[0]) {
      const { averageRating } = res[0]

      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageRating: Math.round(averageRating * 10) / 10
      })
    } else {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageRating: undefined
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// Call getAverageRating after save
ReviewSchema.post('save', async function (doc, next) {
  await this.constructor.getAverageRating(doc.bootcamp)
  return next()
})

// Call getAverageRating after remove
ReviewSchema.post('remove', async function (doc, next) {
  await this.constructor.getAverageRating(doc.bootcamp)
  return next()
})

module.exports = model('Review', ReviewSchema)
