const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
    name:String,
    city: String,
    state: String,
    dateOfBirth: String,
    gender: String,
    interests: [String],
    education: [{
      campus:String,
      passingYear:String
    }],
    contact: {
        phone: String,
        alternateEmail: String
    },
    pinCode:String
});

const UserDetail = mongoose.model('UserDetail', UserDetailsSchema);

module.exports = UserDetail;
