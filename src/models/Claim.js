const { Schema, model } = require('mongoose');

const claimSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Claim name is required!'],
            trim: true,
        },
        value: {
            type: String,
            required: [true, 'Claim value is required!'],
            trim: true
        },
        property_id: {
            type: Schema.Types.ObjectId,
            ref: 'Property',
            required: [true, 'Claim should belong to a property!']
        }
    }
);

const Claim = model('Claim', claimSchema);

module.exports = Claim;
