const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController.js");
const commentController = require("../controllers/commentController.js");
const likeController = require("../controllers/likeController.js");
const { protect } = require("../middleware/authMiddleware.js");
const upload = require("../middleware/upload.js");

router.get("/tagged/:userId", postController.getTaggedPostsByUser);

router.get("/feed", protect, postController.getFollowingPostsFeed);
router.get("/liked", protect, postController.getLikedPosts);
router.get("/videos", postController.getVideoPosts);
router.get("/:id", postController.getPostById);
router.get("/", protect, postController.getDiscoveryFeedPosts);
router.post("/", protect, upload.single("content"), postController.createPost); // add protect here
router.patch(
  "/:id",
  protect,
  upload.single("content"),
  postController.updatePost
);
router.delete("/:id", protect, postController.deletePost);

router.post("/:id/comments", protect, commentController.addComment);
router.get("/:id/comments", commentController.getCommentsForPost);

router.post("/:id/likes", protect, likeController.toggleLike);

router.get('/:postId/likers', postController.getPostLikers);

router.get(
  "/:id/likes",
  (req, res, next) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      return protect(req, res, next);
    }
    next();
  },
  likeController.getLikesCountForPost
);

module.exports = router;
