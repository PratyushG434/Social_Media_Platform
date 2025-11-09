const db = require('../db/db');
const bcrypt = require('bcryptjs');


exports.getUserById = async (userId) => {
    const result = await db.query(
        `SELECT user_id, username, email, display_name, bio, profile_pic_url, join_date, acc_status
         FROM users
         WHERE user_id = $1;`,
        [userId]
    );
    return result.rows[0] || null;
};


exports.updateUserProfile = async (targetUserId, authenticatedUserId, updateData) => {

    if (targetUserId !== authenticatedUserId) {
        throw new Error('Not authorized to update this profile.'); // Authorization check
    }

    const userExistsResult = await db.query(
        `SELECT user_id FROM users WHERE user_id = $1;`,
        [targetUserId]
    );
    if (userExistsResult.rows.length === 0) {
        return null;
    }
    const updateFields = [];
    const queryParams = [targetUserId];
    let paramIndex = 2;

    if (updateData.display_name !== undefined) {
        updateFields.push(`display_name = $${paramIndex++}`);
        queryParams.push(updateData.display_name);
    }
    if (updateData.bio !== undefined) {
        updateFields.push(`bio = $${paramIndex++}`);
        queryParams.push(updateData.bio);
    }
    if (updateData.profile_pic_url !== undefined) {
        updateFields.push(`profile_pic_url = $${paramIndex++}`);
        queryParams.push(updateData.profile_pic_url);
    }
    if (updateData.dob !== undefined) {
        updateFields.push(`dob = $${paramIndex++}`);
        queryParams.push(updateData.dob);
    }
    if (updateData.gender !== undefined) {
        updateFields.push(`gender = $${paramIndex++}`);
        queryParams.push(updateData.gender);
    }

    if (updateFields.length === 0) {
        throw new Error('No valid fields provided to update.');
    }

    const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE user_id = $1
        RETURNING user_id, username, email, display_name, bio, profile_pic_url, dob, gender, join_date, acc_status;
    `;

    const result = await db.query(query, queryParams);
    return result.rows[0];

}

exports.changeUserPassword = async (userId, currentPassword, newPassword) => {
    const userResult = await db.query(
        `SELECT user_id, password_hash FROM users WHERE user_id = $1;`,
        [userId]
    );
    const user = userResult.rows[0];

    if (!user) {
        throw new Error('User not found.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
        `UPDATE users SET password_hash = $1 WHERE user_id = $2;`,
        [hashedNewPassword, userId]
    );

    return true;
};
