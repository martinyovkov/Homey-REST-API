const router = require('express').Router();

const userController = require('./controllers/userController');
const propertyController = require('./controllers/propertyController');

router.use(userController);
router.use('/properties', propertyController);

module.exports = router;