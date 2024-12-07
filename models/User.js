const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['student', 'campus'],
    required: true
  },
  mobileNumber: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  userDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetail'
  },
  campusDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CampusDetail'
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

