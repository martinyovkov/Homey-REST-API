const User = require('../models/User');

exports.getUserByEmail = (email) => User.findOne({ email })
    .lean()
    .then(user => user)
    .catch(err => null)
