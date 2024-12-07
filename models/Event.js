const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: false },
    description: { type: String, required: false },
    location: { type: String, required: false },
    dateTime: { type: Date, required: false },
    organizer: { type: String, required: false },
    category: { type: String, required: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    capacity: { type: Number, required: false },
    registrationDeadline: { type: Date },
    price: { type: Number },
    images: [{
        url: String,
        filename: String
    }],
    pinCode: String,
    campus: String,
    status: { type: String, enum: ['upcoming', 'ongoing', 'past'], default: 'upcoming' }
}, { timestamps: false });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
