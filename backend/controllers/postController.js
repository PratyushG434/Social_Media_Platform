const postService = require('../services/postService');
const cloudinary = require('../db/cloudinary')

exports.createPost = async (req, res) => {
    const userId = req.user.user_id;
    const { content, content_type } = req.body;
  
    // File (image/video) comes from frontend form-data field 'file'
    const file = req.file;
  
    if (!content && !file) {
      return res.status(400).json({ message: 'Post must contain either text or media.' });
    }
  
    if (!content_type || !['text', 'image', 'video'].includes(content_type)) {
      return res.status(400).json({ message: 'Invalid content_type (must be text, image, or video).' });
    }
  
    try {
      let media_url = null, public_id = null;
  
      // Upload media to Cloudinary if provided
      if (file) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: 'posts',
          resource_type: content_type === 'video' ? 'video' : 'image',
        });
        media_url = uploadResult.secure_url;
        public_id = uploadResult.public_id;
      }
  
      const newPost = await postService.createPost(userId, content, media_url, content_type, public_id);
      res.status(201).json({
        message: 'Post created successfully!',
        post: newPost,
      });
  
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Server error creating post.' });
    }
  };


  exports.getDiscoveryFeedPosts = async (req, res) => { // Renamed from getPosts
    const currentUserId = req.user.user_id; // Get the ID of the authenticated user

    try {
        // Delegate fetching the discovery feed posts to the post service
        const postsFeed = await postService.getDiscoveryFeedPosts(currentUserId);

        res.status(200).json({
            message: 'Discovery feed posts fetched successfully!',
            posts: postsFeed
        });

    } catch (error) {
        console.error('Error fetching discovery feed posts:', error);
        res.status(500).json({ message: 'Server error fetching discovery feed posts.' });
    }
};

exports.getFollowingPostsFeed = async (req, res) => {
  const currentUserId = req.user.user_id; // Get the ID of the authenticated user

  try {
      // Delegate fetching the following posts feed to the post service
      const postsFeed = await postService.getFollowingPostsFeed(currentUserId);

      res.status(200).json({
          message: 'Following feed posts fetched successfully!',
          posts: postsFeed
      });

  } catch (error) {
      console.error('Error fetching following posts feed:', error);
      res.status(500).json({ message: 'Server error fetching following feed posts.' });
  }
};


exports.getPostById = async (req, res) => {
    const { id: postId } = req.params;

    try {
        const post = await postService.getPostById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        res.status(200).json({
            message: 'Post fetched successfully!',
            post: post
        });

    } catch (error) {
        console.error('Error fetching post by ID:', error);
        res.status(500).json({ message: 'Server error fetching post.' });
    }
};


exports.updatePost = async (req, res) => {
    const userId = req.user.user_id;
    const { id: postId } = req.params;
    const { content, media_url, content_type } = req.body;

    if (!content && !media_url && !content_type) {
        return res.status(400).json({ message: 'At least one field (content, media_url, content_type) is required for update.' });
    }
    if (content_type && !['text', 'image', 'video'].includes(content_type)) {
        return res.status(400).json({ message: 'Invalid content_type. Must be "text", "image", or "video".' });
    }

    try {
        const updatedPost = await postService.updatePost(postId, userId, { content, media_url, content_type });

        if (!updatedPost) {
            const postExists = await postService.getPostById(postId);
            if (!postExists) {
                return res.status(404).json({ message: 'Post not found.' });
            }
            return res.status(400).json({ message: 'No valid fields provided for update or other issue.' });
        }

        res.status(200).json({
            message: 'Post updated successfully!',
            post: updatedPost
        });

    } catch (error) {
        console.error('Error updating post:', error);
        if (error.message === 'Not authorized to update this post.') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating post.' });
    }
};

exports.deletePost = async (postId) => {
    try {
      // 1️⃣ Get Cloudinary public ID and content type
      const result = await db.query(
        `SELECT cloudinary_public_id, content_type FROM posts WHERE post_id = $1`,
        [postId]
      );
  
      const post = result.rows[0];
      if (!post) return false;
  
      // 2️⃣ Delete post record from DB
      await db.query(`DELETE FROM posts WHERE post_id = $1`, [postId]);

      // 3️⃣ Delete media from Cloudinary (if it exists)
      if (post.cloudinary_public_id) {
        const resourceType =
          post.content_type === 'video' ? 'video' : 'image';
  
        await cloudinary.uploader.destroy(
          post.cloudinary_public_id,
          { resource_type: resourceType }
        );
      }
  
  
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };