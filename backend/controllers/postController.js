const postService = require('../services/postService');
const cloudinary = require('../db/cloudinary');
const fs = require('fs');

exports.createPost = async (req, res) => {
  const userId = req.user.user_id;
  const { content, content_type } = req.body;
  const file = req.file;

  if (!content && !file) {
    return res.status(400).json({ message: 'Post must contain either text or media.' });
  }

  if (!content_type || !['text', 'image', 'video'].includes(content_type)) {
    return res.status(400).json({ message: 'Invalid content_type (must be text, image, or video).' });
  }

  try {
    let media_url = null, public_id = null;

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
  } finally {
    // clean up loacally saved file after upload
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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


exports.getVideoPosts = async (req, res) => {
  try {
      const videoPosts = await postService.getVideoPosts();

      res.status(200).json({
          message: 'Video posts fetched successfully!',
          posts: videoPosts
      });

  } catch (error) {
      console.error('Error fetching video posts:', error);
      res.status(500).json({ message: 'Server error fetching video posts.' });
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
  const { content, content_type } = req.body;
  const file = req.file; // Capture the file

  // Validate inputs
  if (!content && !file && !content_type) {
    if (file) fs.unlinkSync(file.path); // Cleanup if validation fails
    return res.status(400).json({ message: 'At least one field is required for update.' });
  }

  try {
    const updateData = { content, content_type };

    // Handle File Upload
    if (file) {
      // 1. Fetch post to find OLD media
      const oldPost = await postService.getPostById(postId);

      // 2. Delete OLD media if it exists and user owns post
      if (oldPost && oldPost.user_id === userId && oldPost.cloudinary_public_id) {
        const type = oldPost.content_type === 'video' ? 'video' : 'image';
        await cloudinary.uploader.destroy(oldPost.cloudinary_public_id, { resource_type: type });
      }

      // 3. Upload NEW media
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'posts',
        resource_type: content_type === 'video' ? 'video' : 'image',
      });
      updateData.media_url = uploadResult.secure_url;
      updateData.cloudinary_public_id = uploadResult.public_id;
    }

    const updatedPost = await postService.updatePost(postId, userId, updateData);

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found or not authorized.' });
    }

    res.status(200).json({ message: 'Post updated successfully!', post: updatedPost });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error updating post.' });
  } finally {
    // Cleanup local file
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};


exports.deletePost = async (req, res) => {
  const userId = req.user.user_id;
  const postId = req.params.id;

  try {
    const deletionResult = await postService.deletePost(postId, userId);

    if (!deletionResult || !deletionResult.deleted) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (deletionResult.publicId) {
      const resourceType = deletionResult.contentType === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(
        deletionResult.publicId,
        { resource_type: resourceType }
      );
      console.log(`Successfully deleted Cloudinary media: ${deletionResult.publicId}`);
    }

    res.status(200).json({ message: 'Post deleted successfully.' });

  } catch (error) {
    console.error('Error deleting post:', error);
    if (error.message === 'Not authorized to delete this post.') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error deleting post.' });
  }
};



exports.getLikedPosts = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const likedPosts = await postService.getLikedPosts(currentUserId);
        res.status(200).json({
            message: 'Liked posts fetched successfully!',
            posts: likedPosts
        });
    } catch (error) {
        console.error('Error fetching liked posts:', error);
        res.status(500).json({ message: 'Server error fetching liked posts.' });
    }
};
