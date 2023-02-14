const Claim = require("../models/Claim");

const { normalize } = require("../utils/mongoErrorNormalizer");

exports.create = (claims) => Claim.create(claims)
    .then(claim => claim)
    .catch(err => { throw normalize('Claims creation error!', err) })

exports.deleteAllByProperty = (property_id) => Claim.deleteMany({ property_id })

exports.getByProperty = (property_id) => Claim.find({ property_id }).lean()
    .then(claims => claims)
    .catch(err => { throw normalize('Claim fetch error!', err) })

exports.getByProperties = (properties) => Claim.find({ property_id: { $in: properties.map(p => p._id) } }).lean()
    .then(claims => claims)
    .catch(err => { throw normalize('Claim fetch error!', err) })

