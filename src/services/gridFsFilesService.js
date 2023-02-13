const mongoose = require('mongoose');

const conn = mongoose.connection;

exports.getFileReadStream = async (bucketName, filename) => {

    try {

        let gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName
        });

        const cursor = await gridfsBucket.find({ filename })
        const file = (await cursor.toArray())[0]

        return gridfsBucket.openDownloadStream(file._id);

    } catch (error) {
        throw 'File not found!'
    }
}

exports.deleteFile = async (bucketName, filename) => {
    try {

        let gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName
        });

        const cursor = await gridfsBucket.find({ filename: filename })
        const file = (await cursor.toArray())[0]
        
        await gridfsBucket.delete(file._id)

        return true
    } catch (error) {
        return false
    }
}