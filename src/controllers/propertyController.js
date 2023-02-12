const router = require('express').Router();

const Auth = require('../middlewares/authMiddleware');
const OnlyAgency = require('../middlewares/onlyAgencyMiddleware');
const IsOwner = require('../middlewares/isOwnerMiddleware')

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

router.patch('/',
    Auth,
    OnlyAgency.bind(null, 'Only agencies are allowed to add properties'),
    IsOwner.bind(null, 'You need to be owner to edit this property'),
    async (req, res) => {

        const propertyDetails = req.body;

        propertyDetails.agency_id = req.user._id;

        try {
            const property = await propertyService.edit(propertyDetails)
            res.json(property)
        } catch (error) { res.status(400).json(error) }
    }
);

module.exports = router;