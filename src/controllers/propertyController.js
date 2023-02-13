const router = require('express').Router();

const Auth = require('../middlewares/authMiddleware');
const OnlyAgency = require('../middlewares/onlyAgencyMiddleware');

const { searchSources, IsOwner } = require('../middlewares/isOwnerMiddleware')

const propertyService = require('../services/propertyService');
const claimsService = require('../services/claimsService');

router.get('/', async (req, res) => {
    try {
        const properties = await propertyService.getAll()
        const meta = await propertyService.getMetadataByFilter({}, false)

        properties = await attachClaims(properties);
        res.json({ properties, meta })
    } catch (error) { res.status(400).json(error) }
})

router.get('/recent', async (req, res) => {

    try {
        const count = !isNaN(req.query.count) ? req.query.count : 0
        let properties = await propertyService.getRecent(count)
        console.log(properties);
        if (properties.length === 0) { return res.json([])}

        if (properties.length === 0) { return res.json([]) }

        properties = await attachClaims(properties);

        const meta = await propertyService.getMetaDataFromProperties(properties)

        res.json({ properties, meta })
    } catch (error) { console.log(error); res.status(400).json(error) }

})

router.get('/:_id', async (req, res) => {
    try {
        const property = await propertyService.getById(req.params._id)

        property = await attachImages([property])
        property = await attachClaims([property]);

        res.json(property)
    } catch (error) { res.status(400).json(error) }
})

router.post('/filtered', async (req, res) => {

    try {
        let properties = await propertyService.getFiltered(req.body)

        properties = await attachClaims(properties);

        const meta = await propertyService.getMetadataByFilter(req.body, false)

        res.json({ properties, meta })
    } catch (error) { console.log(error); res.status(400).json(error) }

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

            if (propertyDetails.claims) {

                propertyDetails.claims = propertyDetails.claims.map(c => ({ ...c, property_id: property._id }))
                await claimsService.deleteAllByProperty(propertyDetails._id);
                property.claims = await claimsService.create(propertyDetails.claims)
            }
            
            res.json(property)
        } catch (error) { 
            console.log(error);
            res.status(400).json(error) }
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