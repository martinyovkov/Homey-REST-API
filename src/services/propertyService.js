const Property = require("../models/Property");
const Claim = require("../models/Claim");

const { normalize } = require('../utils/mongoErrorNormalizer');

exports.create = async (property) => {

    let newProperty;

    try {
        newProperty = await Property.create(property)
        newProperty = newProperty._doc;
    } catch (err) { throw normalize('Property creation error!', err) }

    try {

        if (property.claims) {
            property.claims = property.claims.map(c => ({ ...c, property_id: newProperty._id }))
            newProperty.claims = await Claim.create(property.claims)
        }

        return newProperty
    } catch (err) { throw normalize('Claims creation error!', err) }
}

exports.getAll = async () => {
    try { return await Property.find({}).populate('agency_id').lean() }
    catch (error) { return [] }
}

exports.edit = async (property) => {

    let updatedProperty;

    try {
        updatedProperty = await Property.findByIdAndUpdate(property._id, property, {
            runValidators: true,
            new: true
        })

        return updatedProperty._doc;
    } catch (err) { throw normalize('Property editing error!', err); }
}

exports.delete = async (_id) => {
    try {
        await Property.findByIdAndDelete(_id)
        return true
    } catch (err) { throw normalize('Property deletion error!', err) }
}

exports.getById = async (_id) => {
    try {
        const property = await Property.findById(_id).populate('agency_id').lean()

        if (!property) { return null }

        return property
    } catch (error) { return null }
}

exports.getFiltered = async (filter) => {

    const findQuery = buildFindQueryByFilter(filter);

    const { page, pageSize } = filter

    if (page && pageSize && !isNaN(page) && !isNaN(pageSize)) {

        try {
            return await Property.find(findQuery).populate('agency_id').lean()
                .skip((page - 1) * pageSize)
                .limit(pageSize)

        } catch (error) { return [] }
    }

    try { return await Property.find(findQuery).populate('agency_id').lean() }
    catch (error) { return [] }
}

exports.getRecent = async (count) => {
    if (!isNaN(count) && count > 0) {
        try {

            return await Property.find().populate('agency_id').lean()
                .sort({ postedOn: 'desc' })
                .limit(count)

        } catch (error) {
            return []
        }
    } else {
        return new Promise((resolve, reject) => { resolve([]) })
    }
}

exports.getTop = async (count) => {
    if (!isNaN(count) && count > 0) {
        try {

            const topProperties = await Promise.all([
                Property.find({}).populate('agency_id').lean().sort({ price: 'desc' }).limit(1),
                Property.find({}).populate('agency_id').lean().sort({ size: 'desc' }).limit(1),
                Property.find({}).populate('agency_id').lean().sort({ yearBuilt: 'desc' }).limit(1),
                Property.find({}).populate('agency_id').lean().sort({ bedrooms: 'desc' }).limit(1),
                Property.find({}).populate('agency_id').lean().sort({ bathrooms: 'desc' }).limit(1),
                Property.find({}).populate('agency_id').lean().sort({ garages: 'desc' }).limit(1)
            ])

            return topProperties.map(p => p[0])

        } catch (error) {
            return []
        }
    } else {
        return new Promise((resolve, reject) => { resolve([]) })
    }
}

exports.getMetaForAll = (pageSize) => this.getMetadataByFilter({ pageSize })
    .then(data => data)

exports.getMetadataByFilter = async (filter, isNormalized = false) => {

    const page = filter.page;
    const pageSize = filter.pageSize;

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

        data.pages = pageSize ? Math.ceil(data.count / pageSize) : data.count

        try {
            data.types = await Property.find(filter)
                .distinct('type');
        } catch (err) { data.types = []; }

    } catch (err) { console.log(err); }

    return data;
}

exports.getMetaDataFromProperties = (properties) => {

    const meta = {
        minPrice: properties[0]?.price,
        maxPrice: properties[0]?.price,
        minYearBuilt: properties[0]?.yearBuilt,
        maxYearBuilt: properties[0]?.yearBuilt,
        minSize: properties[0]?.size,
        maxSize: properties[0]?.size,
        minBedrooms: properties[0]?.bedrooms,
        maxBedrooms: properties[0]?.bedrooms,
        minBathrooms: properties[0]?.bathrooms,
        maxBathrooms: properties[0]?.bathrooms,
        minGarages: properties[0]?.garages,
        maxGarages: properties[0]?.garages,
        count: properties.length
    };

    meta.types = properties.reduce((arr, curr) => arr.includes(curr.type) ? arr : [curr.type, ...arr], []);

    if (properties.length > 0) {

        const metaProps = ['minPrice', 'maxPrice', 'minYearBuilt', 'maxYearBuilt', 'minSize', 'maxSize', 'minBedrooms', 'maxBedrooms', 'minBathrooms', 'maxBathrooms', 'minGarages', 'maxGarages'];

        metaProps.forEach(prop => {
            let propertyProperty = prop.slice(3);
            propertyProperty = propertyProperty.charAt(0).toLowerCase() + propertyProperty.slice(1)

            if (prop.slice(0, 3) === 'min') {
                meta[prop] = properties
                    .reduce((prev, curr) => prev < curr[propertyProperty]
                        ? prev
                        : curr[propertyProperty]
                        , properties[0][propertyProperty]
                    );
            } else if (prop.slice(0, 3) === 'max') {
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