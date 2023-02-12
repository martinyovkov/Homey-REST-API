const { Schema, model } = require('mongoose');

const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required!'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required!'],
      minLength: [2, 'First name should be at least 2 characters long!'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required!'],
      minLength: [2, 'Last name should be at least 2 characters long!'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Incorrect password! (It should be at least 8 symbols)']
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return validator.isMobilePhone(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    city: {
      type: String,
      minLength: [3, 'City should be at least 3 characters long!'],
    },
    address: {
      type: String,
      minLength: [3, 'Address should be at least 3 characters long!'],
    }
  });

userSchema
  .path('email')
  .validate(
    (value) => validator.isEmail(value)
    , 'Invalid email!'
  );

userSchema.pre('save', function (next) {

  const trimmedEmail = validator.trim(this.email);
  const escapedEmail = validator.escape(trimmedEmail);
  const normalizedEmail = validator.normalizeEmail(escapedEmail);
  this.email = normalizedEmail;

  this.firstName = validator.trim(this.firstName);
  this.firstName = validator.escape(this.firstName);

  this.lastName = validator.trim(this.lastName);
  this.lastName = validator.escape(this.lastName);

  this.password = validator.escape(this.password);
  this.password = validator.trim(this.password);

  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {

      this.password = hashedPassword;

      next();

    });

});

const User = model('User', userSchema);
module.exports = User;
