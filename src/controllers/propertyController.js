const router = require('express').Router();

const Auth = require('../middlewares/authMiddleware');
const OnlyAgency = require('../middlewares/onlyAgencyMiddleware');
const { searchSources, IsOwner } = require('../middlewares/isOwnerMiddleware')

const { uploadToGridFS } = require('../middlewares/uploadMiddleware');
const uploadImage = uploadToGridFS(['image/jpeg', 'image/x-png', 'image/png'], 'images')
    .array("image")

const propertyService = require('../services/propertyService');
const { deleteFile } = require('../services/gridFsFilesService');
const imagesService = require('../services/imageService');
const claimsService = require('../services/claimsService');

router.get('/meta', async (req, res) => {
    try {

        res.json(await propertyService.getMetaForAll(req.query?.pageSize))

    } catch (error) { res.json(error) }
})

router.get('/', async (req, res) => {
    try {
        let properties = await propertyService.getAll()
        const meta = await propertyService.getMetadataByFilter({}, false)

        properties = await attachImages(properties)
        properties = await attachClaims(properties);

        res.json({ properties, meta })
    } catch (error) { console.log(error); res.status(400).json(error) }
})

router.get('/recent', async (req, res) => {

    try {
        const count = !isNaN(req.query.count) ? req.query.count : 0
        let properties = await propertyService.getRecent(count)

        if (properties.length === 0) { return res.json([]) }

        properties = await attachImages(properties)
        properties = await attachClaims(properties);

        const meta = await propertyService.getMetaDataFromProperties(properties)

        res.json({ properties, meta })
    } catch (error) { console.log(error); res.status(400).json(error) }

})

router.get('/top', async (req, res) => {

    try {
        const count = !isNaN(req.query.count) ? req.query.count : 0
        let properties = await propertyService.getTop(count)

        if (properties.length === 0) { return res.json([]) }

        properties = await attachImages(properties)
        properties = await attachClaims(properties);

        const meta = await propertyService.getMetaDataFromProperties(properties)

        res.json({ properties, meta })
    } catch (error) { console.log(error); res.status(400).json(error) }

})

router.get('/:_id', async (req, res) => {
    try {
        let property = await propertyService.getById(req.params._id)

        property = await attachImages([property])
        property = await attachClaims(property);

        res.json(property)
    } catch (error) { res.status(400).json(error) }
})

router.post('/filtered', async (req, res) => {

    try {
        let properties = await propertyService.getFiltered(req.body)

        properties = await attachImages(properties)
        properties = await attachClaims(properties);

        const meta = await propertyService.getMetadataByFilter(req.body, false)

        res.json({ properties, meta })
    } catch (error) { console.log(error); res.status(400).json(error) }

})

router.post('/',
    Auth,
    OnlyAgency.bind(null, 'Only agencies are allowed to add properties'),
    (req, res) => {
        uploadImage(req, res, async function (err) {

            const propertyDetails = req.body;
            propertyDetails.agency_id = req.user._id;

            let property;

            try { property = await propertyService.create(propertyDetails) }
            catch (error) {
                if (!err) {
                    req.files.forEach(f => { deleteFile('images', f.filename) })
                }

                return res.status(400).json(error)
            }

            if (err) {
                await propertyService.delete(property._id)
                return res.json({ message: err.message })
            }

            if (!req.files) { return res.json({ message: 'Property should have images!' }) }

            try {
                if (propertyDetails.claims) {
                    try {
                        claimsService.create(propertyDetails.claims
                            .map(claim => ({ name: claim, value: claim, property_id: property._id }))
                        )
                    } catch (error) {
                        await propertyService.delete(property._id)
                        return res.json({ message: err.message })
                    }
                }

            } catch (error) {
                if (!err) {
                    req.files.forEach(f => { deleteFile('images', f.filename) })
                }

                return res.status(400).json(error)
            }

            try { req.files.forEach(file => { imagesService.create(file.filename, property._id) }) }
            catch (error) { return res.json({ message: error }) }

            property.images = req.files.map(f => f.filename);

            res.json(property)
        })
    }
);

router.patch('/:_id',
    Auth,
    OnlyAgency.bind(null, 'Only agencies are allowed to edit properties'),
    IsOwner.bind(null, searchSources.params, 'You need to be owner to edit this property'),
    (req, res) => {
        uploadImage(req, res, async function (err) {

            if (err) { return res.json({ message: err.message }) }

            const propertyDetails = req.body;
            propertyDetails._id = req.property_id || req.params._id;

            let property;
            try {
                property = await propertyService.edit(propertyDetails)

                if (propertyDetails.claims) {

                    propertyDetails.claims = Array.isArray(propertyDetails.claims)
                        ? propertyDetails.claims
                        : [propertyDetails.claims];

                    propertyDetails.claims = propertyDetails.claims.map(c => ({ name: c, value: c, property_id: property._id }))
                    await claimsService.deleteAllByProperty(propertyDetails._id);
                    property.claims = await claimsService.create(propertyDetails.claims)
                }
            } catch (error) {
                console.log(error);
                req.files.forEach(f => { deleteFile('images', f.filename) })

                return res.status(400).json(error)
            }

            if (!req.files) { return res.json({ message: 'Property should have images!' }) }

            try { await imagesService.replace(req.files.map(f => f.filename), property._id) }
            catch (error) { return res.json(error) }

            property.images = req.files.map(f => f.filename);

            property = await attachClaims([property])
            res.json(property)
        })
    }
);

router.delete('/:_id',
    Auth,
    OnlyAgency.bind(null, 'Only agencies are allowed to delete properties'),
    IsOwner.bind(null, searchSources.params, 'You need to be owner to delete this property'),
    async (req, res) => {
        try {
            const property = await propertyService.delete(req.property_id || req.params._id)

            await claimsService.deleteAllByProperty(property._id)

            res.json(property)
        } catch (error) { res.status(400).json(error) }
    }
);

async function attachImages(properties) {

    try {
        properties = properties.map(p => ({ ...p, images: [] }))

        const images = await imagesService.getByProperties(properties)
        images.forEach(i => {

            properties.filter(p => p._id.toString() === i.property_id.toString())
                .forEach(p => p.images.push(i.filename))

        })

        return properties
    } catch (error) {
        console.log(error);
        return []
    }

}

async function attachClaims(properties) {

    try {
        properties = properties.map(p => ({ ...p, claims: [] }))

        const claims = await claimsService.getByProperties(properties);
        claims.forEach(c => {

            properties.filter(p => p._id.toString() === c.property_id.toString())
                .forEach(p => p.claims.push(c))

        })

        return properties
    } catch (error) { return [] }

}

module.exports = router;