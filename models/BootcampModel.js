const { Schema, model } = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
      type: String,
      match: [
        /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/,
        'URL is invalid (Must include HTTP or HTTPS)'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Email is not valid'
      ]
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating range is between 1 to 10'],
      max: [10, 'Rating range is between 1 to 10']
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
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
  },
  // Virtuals settings
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

// Create slug from name before saving
BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  return next()
})

// Geocode and create location fields
BootcampSchema.pre('save', async function (next) {
  const [loc] = await geocoder.geocode(this.address)

  this.location = {
    type: 'Point',
    coordinates: [loc.longitude, loc.latitude],
    formattedAddress: loc.formattedAddress,
    street: loc.streetName,
    city: loc.city,
    state: loc.stateCode,
    zipcode: loc.zipcode,
    country: loc.countryCode
  }

  return next()
})

// Cascade delete courses after a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
  await this.model('Course').deleteMany({ bootcamp: this._id })
  return next()
})

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
})

module.exports = model('Bootcamp', BootcampSchema)
