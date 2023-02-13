const router = require('express').Router();

const mongoose = require('mongoose');
const { getFileReadStream } = require('../services/gridFsFilesService');

let gridfsBucket;

const conn = mongoose.connection;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'images'
    });
});

router.get('/:filename', async (req, res) => {

    try {
        const readStream = await getFileReadStream('images', req.params.filename)
        readStream.pipe(res)

    } catch (error) {
        res.json({ message: 'Image not found!' })
    }
})

module.exports = router