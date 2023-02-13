const Image = require("../models/Image");

const { normalize } = require("../utils/mongoErrorNormalizer");

exports.create = (filename, property_id) => Image.create({ filename, property_id })
    .then(image => image)
    .catch(err => { throw normalize('Image creation error!', err) })

exports.getByProperty = (property_id) => Image.find({ property_id }).lean()
    .then(images => images)
    .catch(err => { throw normalize('Image fetch error!', err) })

exports.getByProperties = (properties) => Image.find({ property_id: { $in: properties.map(p => p._id) } }).lean()
    .then(images => images)
    .catch(err => { throw normalize('Image fetch error!', err) })

