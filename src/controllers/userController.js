const router = require('express').Router();

const authService = require('../services/authService');
const agencyService = require('../services/agencyService');
const userService = require('../services/userService');

const { COOKIE_SESSION_NAME } = require('../../constants');

router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: 400, message: 'Email and pasword are required!' });
    }

    try {
        const user = await authService.login(email, password);
        const token = await authService.createToken(user, user.role);
        
        const cookieSettings = { httpOnly: true }

        if (process.env.ENVIRONMENT !== 'development') {
            app.set('trust proxy', 1)
            cookieSettings.secure = true
            cookieSettings.sameSite = 'none'
        }

        res.cookie(COOKIE_SESSION_NAME, token, cookieSettings);
        res.status(200).json({ user });

    } catch (error) {
        res.status(400).json({ status: 400, ...error });
    }

});


router.post('/register/user', async (req, res) => {
    const { email, firstName, lastName, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
        return res.status(400).json({ status: 400, message: 'Password mismatch!' })
    }

    try {
        const agency = await agencyService.getAgencyByEmail(email);

        if (agency) { throw { message: 'This email already exists!' } }

        const user = await authService.create('User', { email, firstName, lastName, password });

        const token = await authService.createToken(user, "user");

        const cookieSettings = { httpOnly: true }

        if (process.env.ENVIRONMENT !== 'development') {
            app.set('trust proxy', 1)
            cookieSettings.secure = true
            cookieSettings.sameSite = 'none'
        }

        res.cookie(COOKIE_SESSION_NAME, token, cookieSettings);
        res.json({ status: 200, user });

    } catch (error) {
        res.status(400).json({ status: 400, ...error });
    }

});

router.post('/register/agency', async (req, res) => {
    const { email, agencyName, city, address, phoneNumber, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
        return res.status(400).json({ status: 400, message: 'Password mismatch!' })
    }

    try {

        const user = await userService.getUserByEmail(email);

        if (user) { throw { message: 'This email already exists!' } }

        const agency = await authService.create('Agency', { email, agencyName, city, address, phoneNumber, password });
        
        const token = await authService.createToken(agency, "agency");

        const cookieSettings = { httpOnly: true }

        if (process.env.ENVIRONMENT !== 'development') {
            cookieSettings.secure = true
            cookieSettings.sameSite = 'none'
        }

        res.cookie(COOKIE_SESSION_NAME, token, cookieSettings);
        res.json({ status: 200, agency });

    } catch (error) {
        res.status(400).json({ status: 400, ...error });
    }

});

router.get('/logout', (req, res) => {
    res.clearCookie(COOKIE_SESSION_NAME);
    res.status(200).json({ message: 'Logged out!' })
});

router.get('/me', async (req, res) => {
    const token = req.cookies[COOKIE_SESSION_NAME];

    if (!token) {
        return res.status(400).json({ status: 400, message: 'You are not logged in!' })
    }

    try {
        const decodedToken = await authService.VerifyToken(token);
        return res.status(200).json({ status: 200, user: { ...decodedToken } })

    } catch (error) {
        res.status(400).json({ status: 400, ...error });
    }
});


module.exports = router;