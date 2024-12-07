require('dotenv').config()
const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const mailSender = require('../utils/mailsender');
const { userDetails } = require('./additionalDetails');

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('hey');
        console.log("Email in sendOtp controller", email)
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: "Email already exists"
            })
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });


        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = OTP.findOne({ otp: otp });
        }
        console.log("OTP generated", otp);

        const createdOtp = OTP({
            email,
            otp
        })
        await createdOtp.save();

        return res.status(200).json({
            success: true,
            message: "OTP created!",
            createdOtp
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Signup Route
exports.signup = async (req, res) => {
    const { name, email, otp, password, role, mobileNumber } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        console.log('hey');
        console.log(req.body);

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            password, // We will hash it later
            role,
            mobileNumber
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        // Save the user
        await newUser.save();
        const userLS = { name: newUser.name, email: newUser.email, role: newUser.role, userId: newUser._id };

        // Create JWT token
        const accessToken = jwt.sign({
            email: newUser.email,
            role: newUser.role,
            userId: newUser._id
        }, process.env.ACCESS_TOKEN_SECRET);

        // Define the redirect URL based on the user's role
        let redirectUrl = '';
        if (role === 'student') {
            redirectUrl = '/user-details';
        } else if (role === 'campus') {
            redirectUrl = '/campus-details';
        } else {
            redirectUrl = '/events';
        }

        res.status(201).json({
            accessToken,
            user: userLS,
            success: true,
            message: 'Account created successfully',
            redirectUrl, // Include redirect URL in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user account' });
    }
};


// Signin Route
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        const userLS = { name: user.name, email: user.email, role: user.role, userId: user._id };
        const accessToken = jwt.sign({ email, role: user.role, userId: user._id }, process.env.ACCESS_TOKEN_SECRET);
        res.cookie('token', accessToken, options).status(200).json({
            accessToken,
            user: userLS,
            userId: user._id,
            message: 'Login successful',
            redirectUrl: '/events',
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Signin Failure, try again' });
    }
};


exports.changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Checking if the old password matches the one in the database
        const isOldPasswordValid = await user.authenticate(oldPassword);
        if (!isOldPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Old password is incorrect',
            });
        }

        // Setting  new password
        await user.setPassword(newPassword);
        await user.save();
        try {
            const emailResponse = await mailSender(user.email, 'Password Changed', `PASSWORD CHANGE CONFIRMATION`
            );
            console.log(emailResponse);

        } catch (error) {
            console.log("Error occured while sending email :", error)
            return res.status(500).json({
                success: false,
                message: 'Error occured while sending email',
                error: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error changing password',
        });
    }
};



exports.signout = async (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        res.send("logged out");
    })

}
const Token = require('../models/Token')

exports.resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const token = Math.random().toString(36).substring(2);
        console.log(token);
        const tokenRecord = new Token({
            user: user._id,
            token
        })
        await tokenRecord.save();

        const resetLink = `http://localhost:3000/reset-password?token=${token}&email=${encodeURIComponent('sarjeetsingh4680@gmail.com')}`
        const emailBody = `Click the following link to reset your password: ${resetLink}`
        await mailSender(email, 'Password Reset', emailBody);
        return res.status(200).json({
            success: true,
            message: 'Password reset link sent successfully',
            resetLink: resetLink
        })
    }
    catch (err) {
        console.log('Error requesting password reset:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmNewPassword } = req.body;
        console.log(req.body);

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password fields do not match'
            });
        }

        const tokenRecord = await Token.findOne({ token });

        if (!tokenRecord) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        const user = await User.findById(tokenRecord.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Use setPassword method provided by passport-local-mongoose to properly hash and set the new password
        user.setPassword(newPassword, async () => {
            await user.save();
            await Token.findByIdAndDelete(tokenRecord._id);
            try {
                const emailResponse = await mailSender(user.email, 'Password Reset Confirmation', 'Your password has been successfully reset. If you did not request this change, please contact us immediately.');
                console.log(emailResponse);

            } catch (error) {
                console.log("Error occured while sending email :", error)
                return res.status(500).json({
                    success: false,
                    message: 'Error occured while sending email',
                    error: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Password reset successfully'
            });
        });

    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}






