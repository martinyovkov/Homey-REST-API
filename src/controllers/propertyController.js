const router = require('express').Router();

const Auth = require('../middlewares/authMiddleware');
const OnlyAgency = require('../middlewares/onlyAgencyMiddleware');

const { searchSources, IsOwner } = require('../middlewares/isOwnerMiddleware')

const propertyService = require('../services/propertyService');

router.get('/', async (req, res) => {
    try {
        const properties = await propertyService.getAll()
        res.json(properties)
    } catch (error) { res.status(400).json(error) }
})

router.post('/',
    Auth,
    OnlyAgency.bind(null, 'Only agencies are allowed to add properties'),
    async (req, res) => {

        const propertyDetails = req.body;

        propertyDetails.agency_id = req.user._id;

        try {
            const property = await propertyService.create(propertyDetails)
            res.json(property)
        } catch (error) { res.status(400).json(error) }
    }
);

router.patch('/:_id',
    Auth,
    OnlyAgency.bind(null, 'Only agencies are allowed to edit properties'),
    IsOwner.bind(null, searchSources.params, 'You need to be owner to edit this property'),
    async (req, res) => {

        const propertyDetails = req.body;
        propertyDetails._id = req.property_id || req.params._id;

        try {
            const property = await propertyService.edit(propertyDetails)
            res.json(property)
        } catch (error) { res.status(400).json(error) }
    }
);

router.delete('/:_id',
    Auth,
    OnlyAgency.bind(null, 'Only agencies are allowed to delete properties'),
    IsOwner.bind(null, searchSources.params, 'You need to be owner to delete this property'),
    async (req, res) => {
        try {
            const property = await propertyService.delete(req.property_id || req.params._id)
            res.json(property)
        } catch (error) { res.status(400).json(error) }
    }
);

module.exports = router;