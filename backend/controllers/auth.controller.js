import { register, login } from './auth.service.js';

export const registerUser = async (req, res) => {
    try {
        const { username, email, password, dob, gender } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
        }

        const { user, token, error } = await register({ username, email, password, dob, gender });
        
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }
        
        res.status(201).json({ success: true, message: 'User registered successfully', data: { user, token } });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const { user, token, error } = await login({ email, password });

        if (error) {
            return res.status(401).json({ success: false, message: error });
        }

        res.status(200).json({ success: true, message: 'Login successful', data: { user, token } });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};