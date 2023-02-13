const { Schema, model } = require('mongoose');

const imageSchema = new Schema(
    {
        filename: {
            type: String,
            required: [true, 'Image filename is required!'],
            trim: true,
        },
        property_id: {
            type: Schema.Types.ObjectId,
            ref: 'Property',
            required: [true, 'Image should belong to a property!']
        }
    }
);

const Image = model('Image', imageSchema);

module.exports = Image;
