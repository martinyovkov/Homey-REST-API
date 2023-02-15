async function OnlyAgency(errorMessage = 'You are not an agency', req, res, next) {

    if(!req.user) {
        return res.status(401).json({ message: 'You are not logged in!'});
    }

    if (req.user.role !== 'agency') {
        console.log(req.user);
        return res.status(400).json({ message: errorMessage});
    }

    next()
}

module.exports = OnlyAgency