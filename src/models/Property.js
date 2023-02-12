const { Schema, model } = require('mongoose');

const propertySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Property name is required!'],
      minLength: [4, 'Property name should be at least 4 characters long!'],
    },
    type: {
      type: String,
      enum: ['house', 'apartment', 'villa', 'landfield', 'other'],
      required: [true, 'Property type is required!']
    },
    status: {
      type: String,
      enum: ['for_sale', 'for_rent'],
      required: [true, 'Property status is required!']
    },
    country: {
      type: String,
      required: [true, 'Property country is required!'],
      maxLength: [56, 'Country length cannot be more than 56']
    },
    city: {
      type: String,
      required: [true, 'Property city is required!'],
      maxLength: [85, 'City length cannot be more than 85']
    },
    street: {
      type: String,
      required: [true, 'Property street is required!'],
      maxLength: [120, 'City length cannot be more than 120']
    },
    number: {
      type: Number,
      max: [9999, 'Building number cannot be more than 9999']
    },
    description: {
      type: String,
      maxLength: [9999, 'Description cannot be more than 5000']
    },
    size: {
      type: Number,
      required: [true, 'Property size is required!'],
      max: [999999, 'Property size cannot be more than 999999'],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Property bedrooms is required!'],
      max: [99, 'Building bedrooms cannot be more than 99']
    },
    bathrooms: {
      type: Number,
      required: [true, 'Property bathrooms is required!'],
      max: [99, 'Building bathrooms cannot be more than 99']
    },
    garages: {
      type: Number,
      required: [true, 'Property garages is required!'],
      max: [99, 'Building garages cannot be more than 99']
    },
    yearBuilt: {
      type: Number,
      required: [true, 'Property year of building is required!']
    },
    price: {
      type: Number,
      required: [true, 'Property price is required!'],
      min: [0, 'Year price cannot be less than 0'],
      max: [99999999999, 'Year price cannot be more than 99999999999'],
    },
    agency_id: {
      type: Schema.Types.ObjectId,
      ref: 'Agency',
      required: [true, 'Property should belong to an agency!']
    }
  }
);

propertySchema
  .path('yearBuilt')
  .validate(value => value > new Date().getFullYear(), 'Invalid year of building!');

propertySchema.pre('save', function (next) {

  this.name = this.name.trim();
  this.country = this.country.trim();
  this.city = this.city.trim();
  this.street = this.street.trim();
  this.description = this.description.trim();

  next()
});

const Property = model('Property', propertySchema);

module.exports = Property;
