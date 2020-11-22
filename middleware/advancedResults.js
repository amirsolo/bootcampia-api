const advancedResults = (model, populate) => async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query }

  // Exclude fields
  const removeFields = ['select', 'sort', 'page', 'limit']
  removeFields.forEach((field) => delete reqQuery[field])

  // Create query string
  let queryStr = JSON.stringify(reqQuery)

  // Create Operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(lte|lt|gt|gte|in)\b/g, (match) => `$${match}`)

  // Finding resource
  let query = model.find(JSON.parse(queryStr))

  // Select fields
  if (req.query.select) {
    let fields = req.query.select.split(',')

    // remeove "-" and "$" from select items (if there was any)
    // "-" is exclusion in Mongo projection and mix of inclusion and exclusion is not allowed in MongoDB projection
    // "$" in the beginning of the string is not allowed and would throw error, So remove all "$"
    fields = fields.map((field) => field.replace(/-|\$/g, '').trim())
    fields = fields.join(' ')

    query = query.select(fields)
  }

  // Sort fields
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    // Sort by createdAt date (descending)
    query = query.sort('-createdAt')
  }

  // Pagination settings
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments(JSON.parse(queryStr))

  query = query.skip(startIndex).limit(limit)

  if (populate) {
    query = query.populate(populate)
  }

  // Executing query
  const results = await query

  // Pagination Result
  let pagination = {}

  // Define next page info
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  // Define previous page info
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  // if there is no result
  if (results.length === 0) {
    pagination = {}
  }

  // Attach the response to res object
  res.advancedResults = {
    success: true,
    pagination,
    count: results.length,
    data: results
  }

  return next()
}

module.exports = advancedResults
