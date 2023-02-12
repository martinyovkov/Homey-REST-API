const { Schema, model } = require('mongoose');

const validator = require('validator');

const agencySchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required!'],
    },
    agencyName: {
      type: String,
      required: [true, 'Agency name is required!'],
      minLength: [2, 'Agency name should be at least 2 characters long!'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Incorrect password! (It should be at least 8 symbols)']
    },
    city: {
      type: String,
      required: [true, 'City is required!'],
      minLength: [3, 'City should be at least 3 characters long!'],
    },
    address: {
      type: String,
      required: [true, 'Addres is required!'],
      minLength: [3, 'Country should be at least 3 characters long!'],
    },
    phoneNumber: {
      type: String,
      match: [/^0[1-9]{1}[0-9]{8}$/, 'Phone number is not valid!'],
    },

  });

agencySchema
  .path('email')
  .validate(
    (value) => validator.isEmail(value)
    , 'Invalid email!'
  );

agencySchema.pre('save', function (next) {

  const trimmedEmail = validator.trim(this.email);
  const escapedEmail = validator.escape(trimmedEmail);
  const normalizedEmail = validator.normalizeEmail(escapedEmail);
  this.email = normalizedEmail;

  this.agencyName = validator.trim(this.firstName);
  this.agencyName = validator.escape(this.firstName);

  this.password = validator.escape(this.password);
  this.password = validator.trim(this.password);

  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {

      this.password = hashedPassword;

      next();

    });

});

const Agency = model('Agency', agencySchema);

module.exports = Agency;
