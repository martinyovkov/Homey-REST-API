const Claim = require("../models/Claim");

const { normalize } = require("../utils/mongoErrorNormalizer");

exports.create = (claims) => Claim.create(Array.isArray(claims) ? claims : [claims])
    .then(claim => claim)
    .catch(err => { throw normalize('Claims creation error!', err) })

exports.deleteAllByProperty = (property_id) => Claim.deleteMany({ property_id })

exports.getByProperty = (property_id) => Claim.find({ property_id }).lean()
    .then(claims => claims)
    .catch(err => { throw normalize('Claim fetch error!', err) })

exports.getByProperties = (properties) => Claim.find({ property_id: { $in: properties.map(p => p._id) } }).lean()
    .then(claims => claims)
    .catch(err => { throw normalize('Claim fetch error!', err) })

exports.getFiltered = (claims, populate = false) => {

    let query = Claim.find({ name: { $in: Array.isArray(claims) ? claims : [claims] } })
    
    if (populate) {
        query = query.populate('property_id')
    }
    
    return query.lean()
        .then(claims => claims)
        .catch(err => { throw normalize('Claim fetch error!', err) })
}