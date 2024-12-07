const Event = require('../models/Event')
const User = require('../models/User');
const EventAttendance = require('../models/EvenetAttendence');
const UserDetail = require('../models/UserDetail');
const mongoose = require('mongoose');

exports.events = async (req, res) => {
    try {
        // Get the section from the query parameters
        const section = req.query.section;

        let events = [];

        // Fetch the UserDetails document corresponding to the user making the request
        const userId = req.user._id  // Use default user ID if req.user is not defined
        const user = await User.findById(userId);

        const userDetails = await UserDetail.findById(user.userDetails);
        // Get the college and pin code from the UserDetails document
        const userCampus = userDetails && userDetails.education.length > 0 ? userDetails.education[0].campus : null;
        const pinCode = userDetails.pinCode;
        console.log(pinCode);

        // Check if there is a search query in the request
        const searchQuery = req.query.search;


        // If there's a search query, filter events based on it
        if (searchQuery) {
            // Filter events by title, description, or any other relevant fields
            events = await Event.find({
                $or: [
                    { title: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search for title
                    { description: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search for description
                    // Add more fields if needed
                ]
            });
        } else {

            switch (section) {
                case 'near-you':
                    // Fetch events based on user's pinCode
                    // You need to implement logic to match events with the user's pinCode
                    events = await Event.find();

                    break;
                case 'your-campus':
                    // Fetch events based on user's college
                    events = await Event.find()
                        .populate('creator')  // Populate the creator field to access the creator's campus
                        .where('organizer')  // Match the creator's campus
                        .equals(userCampus);
                    break;
                case 'recommended':
                    // Fetch all events
                    events = await Event.find({});
                    break;
                default:
                    events = await Event.find({});
                    break;
            }
        }
        res.status(200).json({ success: true, events: events });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.showEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        // Find the event by ID
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Find all attendees for this event
        const attendees = await EventAttendance.find({ event: eventId })
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            message: 'Event found',
            event: event,
            attendees: attendees.map(attendance => attendance.user), // Extract user details
            userId: req.user._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.newEvent = async (req, res) => {
    try {
        const eventData = req.body;
        if (req.user.role !== 'campus') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        let uploadedImages = [];
        console.log(req.files);
        // Handle uploaded images


        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(file => ({
                url: file.path,
                filename: file.filename
            }));
        }
        console.log('----------------------------');
        console.log(uploadedImages)
        console.log('---------------------------');

        const newEvent = new Event({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            dateTime: eventData.dateTime,
            organizer: eventData.organizer,
            category: eventData.category,
            creator: req.user._id,
            capacity: eventData.capacity,
            registrationDeadline: eventData.registrationDeadline,
            images: uploadedImages,
            price: eventData.price,
            status: eventData.status,
            pinCode: eventData.pinCode,
            campus: eventData.campus
        });

        await newEvent.save();
        // console.log(newEvent);
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: newEvent
        });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
            success: false,
            message: 'Error creating event'
        });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const eventData = req.body;
        if (req.user.role !== 'campus') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        let updateData = { ...eventData };

        // Handle new images if uploaded
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: file.path,
                filename: file.filename
            }));

            // Get existing event
            const existingEvent = await Event.findById(eventId);

            // Optional: Delete old images from Cloudinary
            if (existingEvent && existingEvent.images) {
                for (const image of existingEvent.images) {
                    if (image.filename) {
                        await cloudinary.uploader.destroy(image.filename);
                    }
                }
            }

            updateData.images = newImages;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            updateData,
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({
            success: false,
            message: 'Error updating event'
        });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (req.user.role !== 'campus') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully',
            redirectURL: '/events'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.eventRegistration = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user._id;
        if (req.user.role !== 'student') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        // Validate eventId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event has reached capacity
        const currentAttendees = await EventAttendance.countDocuments({ event: eventId });
        if (event.capacity && currentAttendees >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Event has reached maximum capacity'
            });
        }

        // Check if user is already registered
        const existingAttendance = await EventAttendance.findOne({
            event: eventId,
            user: userId
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered for the event'
            });
        }

        // Create a new attendance record
        const newAttendance = new EventAttendance({
            event: eventId,  // Changed from eventId to event
            user: userId,    // Changed from userId to user
            status: 'registered',
            paymentStatus: event.price > 0 ? 'pending' : 'completed'
        });

        await newAttendance.save();

        // Fetch the updated list of attendees with user details
        const updatedAttendees = await EventAttendance.find({ event: eventId })
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            message: 'User registered successfully for the event',
            attendees: updatedAttendees
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


exports.getCreatedEvents = async (req, res) => {
    try {
        const userId = req.user._id;  // Get userId from authenticated user (req.user is set by isAuthenticated)
        const user = await User.findById(userId);
        if (req.user.role !== 'campus') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'campus') {
            return res.status(403).json({ message: 'Unauthorized access. Only campus users can access created events.' });
        }

        const events = await Event.find({ creator: userId })

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRegisteredEvents = async (req, res) => {
    try {
        const userId = req.user._id; // Get userId from authenticated user (req.user is set by isAuthenticated middleware)

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'student') {
            return res.status(403).json({ message: 'Unauthorized access. Only students can access registered events.' });
        }

        // Find event attendances for the user
        const eventAttendances = await EventAttendance.find({ user: userId }).populate('event');

        // Extract the events from the event attendances
        const events = eventAttendances.map(attendance => attendance.event);

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Add these new methods to your existing controller

exports.unregisterFromEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user._id;

        // Validate eventId

        if (req.user.role !== 'student') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        // Check if user is actually registered
        const attendance = await EventAttendance.findOne({
            event: eventId,
            user: userId
        });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'User is not registered for this event'
            });
        }

        // Delete the attendance record
        await EventAttendance.findByIdAndDelete(attendance._id);

        // Fetch updated attendee list
        const updatedAttendees = await EventAttendance.find({ event: eventId })
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            message: 'Successfully unregistered from the event',
            attendees: updatedAttendees
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


exports.getEventAttendanceData = async (req, res) => {
    try {
        const { eventId } = req.params;
        const user = req.user;
        if (req.user.role !== 'campus') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        // Validate eventId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if the requesting user is the event creator or campus
        if (user.role !== 'campus' || event.creator.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view attendance data'
            });
        }

        // Get detailed attendance data
        const attendanceData = await EventAttendance.find({ event: eventId })
            .populate('user', 'name email')
            .select('user status registrationDate checkinTime checkoutTime paymentStatus notes')
            .sort('registrationDate');

        // Calculate some statistics
        const statistics = {
            totalRegistered: attendanceData.length,
            attended: attendanceData.filter(a => a.status === 'attended').length,
            cancelled: attendanceData.filter(a => a.status === 'cancelled').length,
            waitlisted: attendanceData.filter(a => a.status === 'waitlisted').length,
            paymentPending: attendanceData.filter(a => a.paymentStatus === 'pending').length,
            paymentCompleted: attendanceData.filter(a => a.paymentStatus === 'completed').length,
        };

        res.status(200).json({
            success: true,
            event: {
                title: event.title,
                dateTime: event.dateTime,
                capacity: event.capacity
            },
            statistics,
            attendanceData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};