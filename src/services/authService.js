const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { SECRET } = process.env;

exports.create = async (userData) => User.create(userData)
    .then(user => { return user; })
    .catch(err => {

        let error = {};

        if (err.name == 'ValidationError') {

            error.message = 'User Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        } else if (err.name == 'MongoServerError') {

            error.message = 'This email already exists!';

        }
        else {

            error.message = err.name;
        }

        throw error;
    });

exports.login = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw { message: 'Invalid email or password!' };
    }

    const isValid = bcrypt.compare(password, user.password);

    if (!isValid) {
        throw { message: 'Invalid email or password!' };
    }

    return user;
};

exports.createToken = (user, role) => {
    const payload = { role: role, _id: user._id, email: user.email };
    const options = { expiresIn: '2d' }
    const tokenPromise = new Promise((resolve, reject) => {
        jwt.sign(payload, SECRET, options, (err, decodedToken) => {
            if (err) {
                return reject(err);
            }
            resolve(decodedToken);
        });
    });

    return tokenPromise;
}

exports.VerifyToken = (token) => {

    return jwt.verify(token, SECRET, (err, decodedToken) => {
        if (err) {
            res.clearCookie(COOKIE_SESSION_NAME);
            throw err;
        }

        return decodedToken;
    });
}
