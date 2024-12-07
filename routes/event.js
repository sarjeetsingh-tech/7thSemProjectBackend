const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const fileUpload = require('../middlewares/fileUpload');

const {
    events,
    showEvent,
    newEvent,
    updateEvent,
    deleteEvent,
    eventRegistration,
    unregisterFromEvent,
    getEventAttendanceData,
    getCreatedEvents,
    getRegisteredEvents
} = require('../controllers/event');

// Get events routes
router.get('/events', isAuthenticated, events);
router.get('/events/:eventId', isAuthenticated, showEvent);
router.get('/events/created', isAuthenticated, getCreatedEvents);
router.get('/events/registered', isAuthenticated, getRegisteredEvents);
router.get('/events/:eventId/attendance', isAuthenticated, getEventAttendanceData);

// Event creation and modification routes
router.post(
    '/events/new',
    isAuthenticated,
    fileUpload,
    newEvent
);

router.put(
    '/events/:eventId',
    isAuthenticated,
    fileUpload,
    updateEvent
);

router.delete('/events/:eventId/delete', isAuthenticated, deleteEvent);

// Registration routes
router.post('/events/:eventId/register', isAuthenticated, eventRegistration);
router.delete('/events/:eventId/unregister', isAuthenticated, unregisterFromEvent);

module.exports = router;