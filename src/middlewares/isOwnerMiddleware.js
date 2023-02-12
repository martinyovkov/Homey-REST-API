const { getById } = require("../services/propertyService");

async function IsOwner(errorMessage = 'You are not the owner of the property', req, res, next) {

    if (!req.user) {
        return res.status(401).json({ message: 'You are not logged in!' });
    }

    if (!req.body?._id) {
        return res.status(400).json({ message: 'No property provided!' })
    }

    try {
        const property = await getById(req.body._id)

        if (!property) { throw `Property with this _id: ${req.body._id}, does not exists!` }

        if (req.user._id !== property.agency_id.toString()) { throw errorMessage }

        next()

    } catch (error) {
        return res.status(400).json({ message: error });
    }
}

module.exports = IsOwner