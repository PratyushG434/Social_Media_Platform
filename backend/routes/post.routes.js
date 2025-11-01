import { Router } from 'express';
import { createPost, getFeedPosts, likePost, addComment } from './post.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.route('/')
    .post(protect, createPost)
    .get(protect, getFeedPosts);

router.post('/:postId/like', protect, likePost);
router.post('/:postId/comment', protect, addComment);

//use cloudinary / multer to store videos and photos
export default router;