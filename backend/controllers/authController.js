const authService = require('../services/authService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.registerUser = async (req, res) => {
    const { username, email, password, display_name, dob } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All required fields (username, email, password) are missing.' });
    }

    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        return res.status(400).json({ message: 'Date of birth must be in YYYY-MM-DD format.' });
    }

    try {
        const newUser = await authService.registerUser(username, email, password, display_name, dob);

        res.status(201).json({
            message: 'User registered successfully!',
            user: newUser
        });

    } catch (error) {
        console.error('Error during user registration:', error);
        if (error.code === '23505') {
            if (error.constraint === 'users_username_key') {
                return res.status(409).json({ message: 'Username already exists.' });
            }
            if (error.constraint === 'users_email_key') {
                return res.status(409).json({ message: 'Email already exists.' });
            }
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
};



exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await authService.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '10h' }
        );

        res.cookie('token', token, {
            httpOnly: true,          // Prevents JS access (mitigates XSS)
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            sameSite: 'Strict',      // Helps prevent CSRF
            maxAge: 10 * 60 * 60 * 1000,  // 10 hour
        });

        res.status(200).json({
            message: 'Logged in successfully!',
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};



exports.logoutUser = (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0), // Set expiration date to the past
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.status(200).json({ message: 'Logged out successfully.' });

    } catch (error) {
        console.error('Error during user logout:', error);
        res.status(500).json({ message: 'Server error during logout.' });
    }
};
