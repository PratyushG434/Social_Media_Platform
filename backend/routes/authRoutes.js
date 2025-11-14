const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Limit each IP to 10 login/register requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});


router.post("/register", authLimiter, authController.registerUser);
router.post("/login", authLimiter, authController.loginUser);
router.post("/logout", protect, authController.logoutUser);


module.exports = router;