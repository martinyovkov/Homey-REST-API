const { COOKIE_SESSION_NAME } = require("../config/constants");

const { verifyAccessToken } = require('../services/authService');

async function Auth(req, res, next) {

    const token = req.cookies[COOKIE_SESSION_NAME];

    if (!token) { return res.status(401).json({ message: 'Unauthorized' }) }

    try {

        const decoded = await verifyAccessToken(token);

        req.user = decoded;

        next();

    } catch (error) {

        res.clearCookie(COOKIE_SESSION_NAME);

        return res.status(401).json({ message: 'Unauthorized' })
    }
}

module.exports = Auth