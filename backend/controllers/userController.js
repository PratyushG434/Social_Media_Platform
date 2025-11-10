const userService = require('../services/userService'); 
const {getFollowing , getFollowers} = require('../services/followService');
const getPostsByUserId = require('../services/postService');
// const getFollowers = require('../services/followService');
const cloudinary = require('../db/cloudinary');

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
        const id = parseInt(userId);
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch followers and following
        const followers = await getFollowers(id);
        const following = await getFollowing(id);
        const posts = await getPostsByUserId(id);

        res.status(200).json({
            message: 'User profile fetched successfully.',
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                display_name: user.display_name,
                bio: user.bio,
                profile_pic_url: user.profile_pic_url,
                dob: user.dob,
                gender: user.gender,
                join_date: user.join_date,
                acc_status: user.acc_status,
                followers: followers,   // list of follower users
                following: following,    // list of following users
                posts : posts           // all the user posts
            }
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
};



exports.updateMyProfile = async (req, res) => {
    const authenticatedUserId = req.user.user_id;
    const { userId: targetUserId } = req.params;

    // ✅ Ensure user updates only their own profile
    if (parseInt(targetUserId) !== authenticatedUserId) {
        return res.status(403).json({ message: "Not authorized to update this user's profile." });
    }

    try {
        // Extract optional text fields
        const { display_name, bio, dob, gender } = req.body;
        const updateData = {};

        if (display_name) updateData.display_name = display_name;
        if (bio) updateData.bio = bio;
        if (dob) updateData.dob = dob;
        if (gender) updateData.gender = gender;

        // ✅ Handle profile picture upload if present
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'profile_pics',
                resource_type: 'image'
            });
            updateData.profile_pic_url = uploadResult.secure_url;
        }

        // ✅ If no data provided
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No fields provided for update." });
        }

        // ✅ Perform the update
        const updatedUser = await userService.updateUserProfile(
            authenticatedUserId,
            authenticatedUserId,
            updateData
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            message: "Profile updated successfully!",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error updating profile:", error);

        if (error.message === "Not authorized to update this user's profile.") {
            return res.status(403).json({ message: error.message });
        }

        if (error.message === "No valid fields provided for profile update.") {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Server error updating profile." });
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


exports.checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

