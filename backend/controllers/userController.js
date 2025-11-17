const userService = require("../services/userService");
const { getFollowing, getFollowers } = require("../services/followService");
const { getPostsByUserId } = require("../services/postService");
// const getFollowers = require('../services/followService');
const cloudinary = require("../db/cloudinary");

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query; // 'q' is our search query parameter

    if (!q || q.trim() === "") {
      return res.status(200).json([]); // Return empty array if search is empty
    }

    const users = await userService.searchUsers(q);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error during user search." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const followers = await getFollowers(userId);
    const following = await getFollowing(userId);
    const posts = await getPostsByUserId(userId);
    const userProfileData = {
      ...user,
      posts: posts,
      followers: followers,
      following: following,
    };

    res.status(200).json({
      message: "User profile fetched successfully.",
      user: userProfileData,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const id = parseInt(userId);
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch all related data
    const followers = await getFollowers(id);
    const following = await getFollowing(id);
    // Pass currentUserId for like status
    const currentUserId = req.user?.user_id;
    const posts = await getPostsByUserId(id, currentUserId);

    // --- FIX 2: Standardize Response for /:userId ---
    // Combine all related data directly into the user object
    const userProfileData = {
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
      followers: followers,
      following: following,
      posts: posts,
    };

    res.status(200).json({
      message: "User profile fetched successfully.",
      user: userProfileData,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error fetching user profile." });
  }
};

exports.updateMyProfile = async (req, res) => {
  const authenticatedUserId = req.user.user_id;
  const { userId: targetUserId } = req.params;

  if (parseInt(targetUserId) !== authenticatedUserId) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this user's profile." });
  }

  try {
    const { display_name, bio, dob, gender } = req.body;
    const updateData = {};

    if (display_name) updateData.display_name = display_name;
    if (bio) updateData.bio = bio;
    if (dob) {
      // Validate format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        return res
          .status(400)
          .json({ message: "Date of birth must be in YYYY-MM-DD format." });
      }
      const birth = new Date(dob);
      if (Number.isNaN(birth.getTime())) {
        return res.status(400).json({ message: "Invalid date of birth." });
      }
      const ageDifMs = Date.now() - birth.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 18) {
        return res
          .status(400)
          .json({ message: "You must be at least 18 years old." });
      }
      updateData.dob = dob;
    }
    if (gender) updateData.gender = gender;

    if (req.file) {
      const currentUser = await userService.getUserById(authenticatedUserId);

      // Delete OLD image from Cloudinary if it exists
      if (currentUser && currentUser.cloudinary_public_id) {
        await cloudinary.uploader.destroy(currentUser.cloudinary_public_id);
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pics",
        resource_type: "image",
      });
      updateData.profile_pic_url = uploadResult.secure_url;
      updateData.public_id = uploadResult.public_id;
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No fields provided for update." });
    }

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
      user: updatedUser,
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
  } finally {
    // 3. Clean up local temp file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.changeMyPassword = async (req, res) => {
  const userId = req.user.user_id; // User ID from JWT
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res
      .status(400)
      .json({ message: "Current password and new password are required." });
  }
  if (current_password === new_password) {
    return res.status(400).json({
      message: "New password cannot be the same as the current password.",
    });
  }
  if (new_password.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters long." });
  }

  try {
    await userService.changeUserPassword(
      userId,
      current_password,
      new_password
    );
    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.message === "User not found.") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Current password is incorrect.") {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error changing password." });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const fullUser = await userService.getUserById(req.user.user_id);
    if (!fullUser) {
      return res.status(404).json({ message: "User from token not found." });
    }
    res.status(200).json(fullUser);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.user_id; // From the 'protect' middleware
    const suggestedUsers = await userService.getSuggestedUsers(currentUserId);
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    res.status(500).json({ message: "Server error fetching suggested users." });
  }
};
