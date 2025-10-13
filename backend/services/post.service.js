import { query } from '../../config/db.js';

export const create = async (postData) => {
    const { userId, content, media_url, content_type } = postData;
    
    const createPostQuery = `
        INSERT INTO posts(user_id, content, media_url, content_type)
        VALUES($1, $2, $3, $4)
        RETURNING *
    `;
    const { rows } = await query(createPostQuery, [userId, content, media_url, content_type]);
    
    return rows[0];
};



export const like = async (userId, postId) => {
    const likeQuery = 'INSERT INTO post_likes(user_id, post_id) VALUES($1, $2)';
    
    try {
        await query(likeQuery, [userId, postId]);
        return { success: true };
    } catch (error) {
        if (error.code === '23505') {
            
            return { success: false, message: "You have already liked this post" };
        }
        console.error(error);
        throw new Error(error.message);
    }
};

export const comment = async (commentData) => {
    const { userId, postId, content } = commentData;
    
    const commentQuery = `
        INSERT INTO comments(user_id, post_id, content)
        VALUES($1, $2, $3)
        RETURNING *
    `;
    
    const { rows } = await query(commentQuery, [userId, postId, content]);
    return rows[0];
};