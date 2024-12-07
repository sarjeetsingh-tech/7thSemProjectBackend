const express = require('express');
const passport = require('passport');
const { signup, sendOtp, signin, signout, changePassword, resetPasswordRequest, resetPassword } = require('../controllers/Auth');
const { getCreatedEvents, getRegisteredEvents } = require('../controllers/event');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');

// Authentication Routes
router.post('/signup', signup)
router.post('/sendotp', sendOtp)
router.post('/signin', signin)
router.post('/changepassword', changePassword);
router.post('/signout', signout)
router.post('/reset-password-request', resetPasswordRequest)
router.post('/reset-password', resetPassword);

// Event Routes
router.get('/events/created', isAuthenticated, getCreatedEvents);    // Get events created by campus
router.get('/events/registered', isAuthenticated, getRegisteredEvents);  // Get events registered by student

// Temporary page accessible only to authenticated users
router.get('/temp', isAuthenticated, (req, res) => {
    res.send('temporary page --- Accessible to only authenticated user');
});

module.exports = router;
