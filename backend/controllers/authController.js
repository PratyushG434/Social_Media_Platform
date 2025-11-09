const authService = require('../services/authService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields (username, email, password) are required.' });
    }

    try {
        const newUser = await authService.registerUser(username, email, password);

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
            if (error.constraint === 'users_username_key') {
                return res.status(409).json({ message: 'Username already exists.' });
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
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Logged in successfully!',
            token,
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