const Property = require("../models/Property");

const { normalize } = require('../utils/mongoErrorNormalizer');

exports.create = (property) => Property.create(property)
    .then(property => property)
    .catch(err => {
        const error = normalize('Property creation error!', err);
        console.log(err);
        throw error
    })

exports.getAll = () => Property.find({}).lean()
    .then(properties => properties)
    .catch(err => [])

exports.edit = (property) => Property.findByIdAndUpdate(property._id, property, {
    runValidators: true
})
    .then(property => property)
    .catch(err => {
        const error = normalize('Property editing error!', err);

        throw error
    })

exports.delete = (_id) => Property.findByIdAndDelete(property._id)
    .then(result => result)
    .catch(err => {
        const error = normalize('Property deletion error!', err);

        throw error
    })