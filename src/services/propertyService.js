const Property = require("../models/Property");

const { normalize } = require('../utils/mongoErrorNormalizer');

exports.create = (property) => Property.create(property)
    .then(property => property)
    .catch(err => {
        const error = normalize('Property creation error!', err);
        throw error
    })

exports.getAll = () => Property.find({}).lean()
    .then(properties => properties)
    .catch(err => [])

exports.edit = (property) => Property.findByIdAndUpdate(property._id, property, {
    runValidators: true,
    new: true
})
    .then(property => property)
    .catch(err => {
        const error = normalize('Property editing error!', err);

        throw error
    })

exports.delete = (_id) => Property.findByIdAndDelete(_id)
    .then(result => result)
    .catch(err => {
        const error = normalize('Property deletion error!', err);
        throw error
    })

exports.getById = (_id) => Property.findById(_id).lean()
    .then(properties => properties)
    .catch(err => null)

exports.getFiltered = (filter) => {

    const findQuery = buildFindQueryByFilter(filter);

    const { page, pageSize } = filter
    
    if (page && pageSize && !isNaN(page) && !isNaN(pageSize)) {
        return Property.find(findQuery).lean()
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .then(properties => properties)
            .catch(err => [])
    }

    return Property.find(findQuery).lean()
        .then(properties => properties)
        .catch(err => [])
}

function buildFindQueryByFilter(filter) {

    const findQuery = {};

    if (filter.country) {
        findQuery['country'] = {}
        findQuery['country']['$regex'] = new RegExp(`^${filter.country}$`, 'i')
    }

    if (filter.type) {
        findQuery['type'] = {}
        findQuery['type']['$regex'] = new RegExp(`^${filter.type}$`, 'i');
    }

    if (filter.priceRange && !filter.priceRange.some(p => isNaN(p))) {
        findQuery['price'] = {}
        findQuery['price']['$gte'] = Number(filter.priceRange[0]);
        findQuery['price']['$lte'] = Number(filter.priceRange[1]);
    }

    if (filter.status) {
        findQuery['status'] = {}
        findQuery['status']['$regex'] = new RegExp(`^${filter.status}$`, 'i');
    }

    if (filter.sizeRange && !filter.sizeRange.some(p => isNaN(p))) {
        findQuery['size'] = {}
        findQuery['size']['$gte'] = Number(filter.sizeRange[0]);
        findQuery['size']['$lte'] = Number(filter.sizeRange[1]);
    }

    if (filter.city) {
        findQuery['city'] = {}
        findQuery['city']['$regex'] = new RegExp(`^${filter.city}$`, 'i');
    }

    if (filter.bedrooms && !isNaN(filter.bedrooms)) {
        findQuery['bedrooms'] = Number(filter.bedrooms)
    }

    if (filter.bathrooms && !isNaN(filter.bathrooms)) {
        findQuery['bathrooms'] = Number(filter.bathrooms)
    }

    if (filter.garages && !isNaN(filter.garages)) {
        findQuery['garages'] = Number(filter.garages)
    }

    if (filter.name) {
        findQuery['name'] = {}
        findQuery['name']['$regex'] = new RegExp(`^${filter.name}$`, 'i')
    }

    return findQuery
}