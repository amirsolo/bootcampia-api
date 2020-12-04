const { Schema, model } = require('mongoose')

const CourseSchema = new Schema({
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

// Get averageCost of bootcamp (Using Aggregation)
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const res = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageCost: { $avg: '$tuition' } } }
  ])

  try {
    if (res[0]) {
      const { averageCost } = res[0]

      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(averageCost / 10) * 10
      })
    } else {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageCost: undefined
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// Call getAverageCost after save
CourseSchema.post('save', async function (doc, next) {
  await this.constructor.getAverageCost(doc.bootcamp)
  return next()
})

// Call getAverageCost after remove
CourseSchema.post('remove', async function (doc, next) {
  await this.constructor.getAverageCost(doc.bootcamp)
  return next()
})

module.exports = model('Course', CourseSchema)
