const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure to import the User model

const isAuthenticated = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = req.cookies.token || req.body.token || authHeader?.replace('Bearer ', '');
   
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        // console.log(decoded)

        // Find the user by ID (from the decoded token)
        const user = await User.findById(decoded.userId); // Assuming 'id' is the field in the token payload

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user);
        // Remove the password field from the user object
        user.password = undefined;

        // Attach the user object to req.user
        req.user = user;
        // console.log(user);

        next();
    });
};

module.exports = isAuthenticated;
