const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.protect = (req, res, next) => {
    let token;
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT verification error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
};
