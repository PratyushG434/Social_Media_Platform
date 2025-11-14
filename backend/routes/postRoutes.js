const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController.js");
const commentController = require("../controllers/commentController.js");
const likeController = require("../controllers/likeController.js");
const { protect } = require("../middleware/authMiddleware.js");
const upload = require("../middleware/upload.js")

router.get('/feed', protect, postController.getFollowingPostsFeed);
router.get('/liked', protect, postController.getLikedPosts);
router.get("/:id", postController.getPostById);
router.get('/', protect, postController.getDiscoveryFeedPosts);
router.post("/", protect, upload.single('content'), postController.createPost); // add protect here 
router.patch("/:id", protect, upload.single('content'), postController.updatePost);
router.delete("/:id", protect, postController.deletePost);


router.post("/:id/comments", protect, commentController.addComment);
router.get('/:id/comments', commentController.getCommentsForPost);


router.post("/:id/likes", protect, likeController.toggleLike);

// We're adding protect as optional here to populate req.user if present,
// so getLikesCountForPost can determine if the current user has liked it.
router.get('/:id/likes', (req, res, next) => {
    // This is a common pattern for "optional" middleware.
    // If the Authorization header is present, call 'protect'.
    // If not, just call 'next()' to proceed to the controller without req.user.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return protect(req, res, next);
    }
    next();
}, likeController.getLikesCountForPost);




module.exports = router;