const Agency = require('../models/Agency');

exports.getAgencyByEmail = (email) => Agency.findOne({ email })
    .lean()
    .then(agency => agency)
    .catch(err => null)
