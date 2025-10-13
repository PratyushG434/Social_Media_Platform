import { Router } from 'express';
import { getUserProfile, followUser, unfollowUser } from './user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/:username', getUserProfile);
router.post('/:userId/follow', protect, followUser); // :userId is the ID of the user to follow
router.delete('/:userId/unfollow', protect, unfollowUser);

export default router;