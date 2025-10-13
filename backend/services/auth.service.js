import { query } from '../../config/db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (userData) => {
    const { username, email, password, dob, gender } = userData;

    // 1. Check if user already exists
    const findUserQuery = 'SELECT email FROM users WHERE email = $1';
    const { rows: existingUsers } = await query(findUserQuery, [email]);

    if (existingUsers.length > 0) {
        return { error: 'User with this email already exists' };
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert new user into the database
    const insertUserQuery = `
        INSERT INTO users(username, email, password_hash, dob, gender, acc_status)
        VALUES($1, $2, $3, $4, $5, 'active')
        RETURNING user_id, username, email
    `;
    // The RETURNING clause is a PostgreSQL feature that returns data from the modified row.
    
    try {
        const { rows } = await query(insertUserQuery, [username, email, hashedPassword, dob, gender]);
        const newUser = rows[0];

        // 4. Generate token
        const token = generateToken(newUser.user_id);
        return { user: newUser, token };
    } catch (dbError) {
        console.error("Database insert error:", dbError);
        return { error: 'Could not register user' };
    }
};

export const login = async (loginData) => {
    const { email, password } = loginData;

    // 1. Find user by email
    const findUserQuery = 'SELECT user_id, username, email, password_hash FROM users WHERE email = $1';
    const { rows } = await query(findUserQuery, [email]);

    const user = rows[0];
    if (!user) {
        return { error: 'Invalid credentials' };
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return { error: 'Invalid credentials' };
    }
    
    // 3. Generate token
    const token = generateToken(user.user_id);

    // Don't send the password hash back
    delete user.password_hash;
    return { user, token };
};