const userService = require('../services/userService'); 

exports.getMe = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'User profile fetched successfully.',
            user: user
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
};







exports.getUserProfile = async (req, res) => {
    const { userId } = req.params; // Get the user ID from URL params

    try {
        const user = await userService.getUserById(parseInt(userId));

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Optionally, remove sensitive data if fetching someone else's profile
        // For now, we're returning public fields already
        res.status(200).json({
            message: 'User profile fetched successfully.',
            user: user
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
};


exports.updateMyProfile = async (req, res) => {
    const authenticatedUserId = req.user.user_id;
    const { userId: targetUserId } = req.params; // User ID from URL (should match authenticatedUserId)

    if (parseInt(targetUserId) !== authenticatedUserId) {
        return res.status(403).json({ message: 'Not authorized to update this user\'s profile.' });
    }

    const { display_name, bio, profile_pic_url, dob, gender } = req.body;

    const updateData = { display_name, bio, profile_pic_url, dob, gender };

    try {
        const updatedUser = await userService.updateUserProfile(
            parseInt(targetUserId),
            authenticatedUserId,
            updateData
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'Profile updated successfully!',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.message === 'Not authorized to update this user\'s profile.') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'No valid fields provided for profile update.') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating profile.' });
    }
};

exports.changeMyPassword = async (req, res) => {
    const userId = req.user.user_id; // User ID from JWT
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    if (current_password === new_password) {
        return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
    }
    if (new_password.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }


    try {
        await userService.changeUserPassword(userId, current_password, new_password);
        res.status(200).json({ message: 'Password changed successfully!' });

    } catch (error) {
        console.error('Error changing password:', error);
        if (error.message === 'User not found.') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Current password is incorrect.') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error changing password.' });
    }
};