const { getById } = require("../services/propertyService");

const searchSources = {
    params: 'params',
    body: 'body'
}

async function IsOwner(
    searchSource = searchSources.params,
    errorMessage = 'You are not the owner of the property',
    req,
    res,
    next
) {

    if (!req.user) {
        return res.status(401).json({ message: 'You are not logged in!' });
    }

    if (!req.body?._id && !req.params?._id) {
        return res.status(400).json({ message: 'No property provided!' })
    }

    let _id;

    switch (searchSource) {
        case searchSources.body:
            _id = req.body?._id
            break;
        case searchSources.params:
            _id = req.params?._id
            break;
        default:
            break;
    }

    try {
        req.property_id = _id || req.params._id || req.body._id;

        const property = await getById(req.property_id)
        
        if (!property) { throw `Property with this _id: ${req.property_id}, does not exists!` }

        if (req.user._id !== property.agency_id.toString()) { throw errorMessage }

        next()

    } catch (error) {
        return res.status(400).json({ message: error });
    }
}

module.exports = { IsOwner, searchSources }