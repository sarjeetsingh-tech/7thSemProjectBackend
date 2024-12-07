const User = require('../models/User')
const UserDetail = require('../models/UserDetail')
const CampusDetail = require('../models/CampusDetail')

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId)
            .populate('userDetails')
            .populate('campusDetails');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user);

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.userDetails = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        console.log(req.body);
        const userDetails = new UserDetail(req.body);
        await userDetails.save();
        console.log(userDetails);
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { userDetails: userDetails._id });

        return res.status(200).json({
            success: true,
            message: 'User details saved successfully',
            redirectURL: '/events',
            userDetails: userDetails
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
exports.campusDetails = async (req, res) => {
    try {
        if (req.user.role !== 'campus') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const campusDetails = new CampusDetail(req.body);
        console.log(req.body);
        console.log(campusDetails._id);

        await campusDetails.save();

        const campusId = req.user._id;
        console.log(campusDetails);

        await User.findByIdAndUpdate(campusId, { campusDetails: campusDetails._id });

        return res.status(200).json({
            success: true,
            message: 'Campus details saved successfully',
            redirectURL: '/events',
            campusDetails: campusDetails
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}
