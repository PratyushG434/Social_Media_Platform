const db = require('../db/db');
const bcrypt = require('bcryptjs');

exports.registerUser = async (username, email, password, display_name = null, dob = null) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
        `INSERT INTO users (username, email, password_hash, display_name, dob)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING user_id, username, email, display_name, dob, join_date;`,
        [username, email, hashedPassword, display_name, dob] 
    );
    return result.rows[0];
};



exports.findUserByEmail = async (email) => {
    const result = await db.query(
        `SELECT user_id, username, email, password_hash FROM users WHERE email = $1;`,
        [email]
    );
    return result.rows[0] || null;
};