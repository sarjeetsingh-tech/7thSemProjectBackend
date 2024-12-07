const express = require('express');
const { userDetails, campusDetails, getUserProfile } = require('../controllers/additionalDetails');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated')



router.get('/user/:userId', isAuthenticated, getUserProfile);
router.post('/user/details', isAuthenticated, userDetails);
router.post('/campus/details', isAuthenticated, campusDetails)
module.exports = router;