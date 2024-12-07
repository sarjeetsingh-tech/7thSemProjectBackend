const mongoose = require('mongoose');

const eventAttendanceSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['registered', 'attended', 'cancelled', 'waitlisted'],
        default: 'registered'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'refunded'],
        default: 'pending'
    },
    checkinTime: Date,
    checkoutTime: Date,
    notes: String
}, {
    timestamps: true
});

eventAttendanceSchema.index({ event: 1, user: 1 }, { unique: true });

const EventAttendance = mongoose.model('EventAttendance', eventAttendanceSchema);

module.exports = EventAttendance;
