const router = require('express').Router();

const userController = require('./controllers/userController');
const propertyController = require('./controllers/propertyController');
const imageController = require('./controllers/imageController');

router.use(userController);
router.use('/properties', propertyController);
router.use('/images', imageController);

module.exports = router;