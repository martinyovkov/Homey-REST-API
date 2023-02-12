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

exports.getRecent = (count) => !isNaN(count) && count > 0
    ? Property.find()
        .sort({ postedOn: 'desc' })
        .limit(count)
        .lean()
        .then(properties => properties)
        .catch(err => [])
    : new Promise((resolve, reject) => {
        resolve([]);
    })

exports.getMetadataByFilter = async (filter, isNormalized = false) => {

    if (!isNormalized) { filter = buildFindQueryByFilter(filter) }

    let data = {};

    let pipelineStages = [];
    pipelineStages.push({ $match: filter });

    pipelineStages.push({
        $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            minYearBuilt: { $min: '$yearBuilt' },
            maxYearBuilt: { $max: '$yearBuilt' },
            minSize: { $min: '$size' },
            maxSize: { $max: '$size' },
            minBedrooms: { $min: '$bedrooms' },
            maxBedrooms: { $max: '$bedrooms' },
            minBathrooms: { $min: '$bathrooms' },
            maxBathrooms: { $max: '$bathrooms' },
            minGarages: { $min: '$garages' },
            maxGarages: { $max: '$garages' },
            count: { $count: {} }
        }
    });

    pipelineStages.push({
        $project: {
            _id: 0,
            minPrice: 1,
            maxPrice: 1,
            minYearBuilt: 1,
            maxYearBuilt: 1,
            minSize: 1,
            maxSize: 1,
            minBedrooms: 1,
            maxBedrooms: 1,
            minBathrooms: 1,
            maxBathrooms: 1,
            minGarages: 1,
            maxGarages: 1,
            count: 1
        }
    });

    try {
        data = (await Property.aggregate([pipelineStages]))[0] || { count: 0 };

        data.pages = filter.pageSize ? Math.ceil(data.count / filter.pageSize) : data.count

        try {
            data.types = await Property.find(filter)
                .distinct('type');
        } catch (err) { data.types = []; }

    } catch (err) { console.log(err); }

    return data;
}

exports.getMetaDataFromProperties = (properties) => {

    const meta = {
        minPrice: properties[0].price,
        maxPrice: properties[0].price,
        minYearBuilt: properties[0].yearBuilt,
        maxYearBuilt: properties[0].yearBuilt,
        minSize: properties[0].size,
        maxSize: properties[0].size,
        minBedrooms: properties[0].bedrooms,
        maxBedrooms: properties[0].bedrooms,
        minBathrooms: properties[0].bathrooms,
        maxBathrooms: properties[0].bathrooms,
        minGarages: properties[0].garages,
        maxGarages: properties[0].garages,
        count: properties.length
    };

    meta.types = properties.reduce((arr, curr) => arr.includes(curr.type) ? arr : [curr.type, ...arr], []);

    if (properties.length > 0) {

        const metaProps = ['minPrice', 'maxPrice', 'minYearBuilt', 'maxYearBuilt', 'minSize', 'maxSize', 'minBedrooms', 'maxBedrooms', 'minBathrooms', 'maxBathrooms', 'minGarages', 'maxGarages'];

        metaProps.forEach(prop => {
            const propertyProperty = prop.slice(3);
            propertyProperty[0] = propertyProperty[0].toLowerCase();

            if (prop.slice(0, 4) === 'min') {
                meta[prop] = properties
                    .reduce((prev, curr) => prev < curr[propertyProperty]
                        ? prev
                        : curr[propertyProperty]
                        , properties[0][propertyProperty]
                    );
            } else if (prop.slice(0, 4) === 'max') {
                meta[prop] = properties
                    .reduce((prev, curr) => prev > curr[propertyProperty]
                        ? prev
                        : curr[propertyProperty]
                        , properties[0][propertyProperty]
                    );
            }
        })
    }

    return meta;
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