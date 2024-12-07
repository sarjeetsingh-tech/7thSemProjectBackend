if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Models
const User = require('./models/User');

// Routes
const userRoute = require('./routes/user');
const additionalDetailsRoute = require('./routes/additionalDetails');
const eventRoute = require('./routes/event');

// Cloudinary
const cloudinary = require('cloudinary');
cloudinary.v2.config({
    cloud_name: 'dsgzsnnzy',
    api_key: '171392762477726',
    api_secret: 'hIUpTZxjJ9wxDRSIkORVu22wh0E',
    secure: true,
});

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/campusVibesNew2')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser())
app.use(cors());

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


// Routes
app.use('/', userRoute);
app.use('/', additionalDetailsRoute);
app.use('/', eventRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
