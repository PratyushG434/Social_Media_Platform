const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const followController = require("../controllers/followController.js");
const { protect } = require("../middleware/authMiddleware.js");
const upload = require('../middleware/upload.js')

router.get("/me", protect, userController.getMe);

router.get('/:userId', userController.getUserProfile);
router.patch('/:userId', protect, upload.single('profile_pic'), userController.updateMyProfile);
router.patch('/:userId/password', protect, userController.changeMyPassword);


router.post("/:userId/follow", protect, followController.toggleFollow);
router.get("/:userId/following", protect, followController.getFollowing);
router.get("/:userId/followers", protect, followController.getFollowers);


router.get("/check", protect, userController.checkAuth);

module.exports = router;

