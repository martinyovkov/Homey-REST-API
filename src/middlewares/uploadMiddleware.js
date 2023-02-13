const multer = require('multer')
const { GridFsStorage } = require('multer-gridfs-storage')

const uploadToGridFS = (matchMymeTypes, bucketName) => {

    const storage = new GridFsStorage({
        url: process.env.DB_QUERYSTRING,
        file: (req, file) => {

            const filename = `${Date.now()}-homey-${file.originalname}`

            return {
                bucketName: bucketName,
                filename: filename
            }
        }
    })

    return multer({
        storage,
        limits: {
            fileSize: 12 * 1024 * 1024
        },
        fileFilter(req, file, callback) {

            if (matchMymeTypes.indexOf(file.mimetype) === -1) {
                return callback(new Error('File type is not supported'))
            }

            callback(null, true)
        }
    })
}
module.exports = {
    uploadToGridFS
}