const router = require('express').Router();

const userController = require('./controllers/userController');
const propertyController = require('./controllers/propertyController');
const imageController = require('./controllers/imageController');

router.use(userController);
router.use('property', propertyController);
router.use( imageController );

module.exports = router;