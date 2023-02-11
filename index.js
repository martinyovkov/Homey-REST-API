require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3001;
const router = require('./src/router');
const { dbInit } = require('./src/config/db.js');
//const { errorHandler } = require('./middlewares/errorHandlerMiddleware');


const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
//app.use(auth); 
app.use(router);


dbInit()
    .then(() => {
        app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`))
    })
    .catch(err => {
        console.log('Application failed:', err);
    });
