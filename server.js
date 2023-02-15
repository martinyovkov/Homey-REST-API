const express = require('express');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const PORT = process.env.PORT || 3001;

const router = require('./src/router');

const { dbInit } = require('./src/config/db.js');

const app = express();

app.use(require('cors')({
    origin: process.env.ORIGIN,
    credentials: true
}))

if (process.env.ENVIRONMENT !== 'development') {
    app.set('trust proxy', 1)
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(router);

dbInit()
    .then(() => {
        app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`))
    })
    .catch(err => {
        console.log('Application failed:', err);
    });
