const router = require('express').Router();

const Auth = require('../middlewares/authMiddleware');
const OnlyAgency = require('../middlewares/onlyAgencyMiddleware');

const propertyService = require('../services/propertyService');

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

module.exports = router;