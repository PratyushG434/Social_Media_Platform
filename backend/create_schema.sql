-- database/create_schema.sql

-- -----------------------------------------------------
-- 1. USERS Table
-- -----------------------------------------------------
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(155) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Added for security (will store bcrypt hash)
    bio TEXT,
    profile_pic_url VARCHAR(255),
    dob DATE,
    gender VARCHAR(10),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acc_status VARCHAR(20) CHECK (acc_status IN ('Active', 'Inactive')) DEFAULT 'Active',
    google_id VARCHAR(200) UNIQUE -- For future Google OAuth
);

-- -----------------------------------------------------
-- 2. FOLLOWS Table (M:M relationship between users)
-- -----------------------------------------------------
CREATE TABLE follows (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (follower_id != following_id) -- A user cannot follow themselves
);

-- -----------------------------------------------------
-- 3. POSTS Table
-- -----------------------------------------------------
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT,
    media_url VARCHAR(200),
    content_type VARCHAR(20) CHECK (content_type IN ('text', 'image', 'video')) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 4. POST_TAGS Table (M:M for tagging users in a post)
-- -----------------------------------------------------
CREATE TABLE post_tags (
    post_id INT NOT NULL,
    user_id INT NOT NULL, -- The user being tagged
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 5. COMMENTS Table
-- -----------------------------------------------------
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL, -- The user who commented
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 6. LIKES Table (Post Likes)
-- -----------------------------------------------------
CREATE TABLE likes (
    like_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, user_id), -- Prevents a user from liking the same post more than once
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 7. STORIES Table
-- -----------------------------------------------------
CREATE TABLE stories (
    story_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    media_url VARCHAR(500),
    content_type VARCHAR(50) NOT NULL,
    content TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours', -- Common practice for stories
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 8. STORY_LIKES Table
-- -----------------------------------------------------
CREATE TABLE story_likes (
    like_id SERIAL PRIMARY KEY,
    story_id INT NOT NULL,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (story_id, user_id),
    FOREIGN KEY (story_id) REFERENCES stories(story_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 9. REACTIONS Table (e.g., emojis on stories)
-- -----------------------------------------------------
CREATE TABLE reactions (
    reaction_id SERIAL PRIMARY KEY,
    story_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction VARCHAR(100) NOT NULL, -- e.g., 'fire', 'heart', 'laugh'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(story_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 10. CHATS Table (Represents a conversation between two users)
-- -----------------------------------------------------
CREATE TABLE chats (
    chat_id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure user1_id is always less than user2_id to prevent duplicate chat rows (user A, user B is the same as user B, user A)
    UNIQUE (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (user1_id < user2_id) -- Enforce sorting for the unique constraint
);

-- -----------------------------------------------------
-- 11. MESSAGES Table
-- -----------------------------------------------------
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Sent', -- e.g., 'Sent', 'Delivered', 'Read'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Optional: Create indices for faster lookups on common foreign keys
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id_user_id ON likes(post_id, user_id);

SELECT 'Database schema created successfully!' AS Status;