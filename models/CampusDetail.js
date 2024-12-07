const mongoose = require('mongoose');

const CampusDetailsSchema = new mongoose.Schema({
    name: String,
    address: String,
    city: String,
    state: String,
    website: String,
    contact: {
        phone: String,
        email: String
    },
    description: String,
    facilities: [String],
    programsOffered: [String],
    pinCode:String
});

const CampusDetail = mongoose.model('CampusDetail', CampusDetailsSchema);

module.exports = CampusDetail;
