// @route     GET /api/v1/bootcamps
// @desc      Get all bootcamps
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Show all bootcamps` })
}

// @route     GET /api/v1/bootcamp
// @desc      Get single bootcamp with the given id
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Show one bootcamp` })
}

// @route     POST /api/v1/bootcamps
// @desc      Create a bootcamp
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `create bootcamp` })
}

// @route     PUT /api/v1/bootcamps/:id
// @desc      Update single bootcamp with the given id
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Update bootcamp` })
}

// @route     DELETE /api/v1/bootcamps
// @desc      Delete Single bootcamp with the given id
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Delete bootcamp` })
}
