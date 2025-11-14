-- database/triggers_for_posts_counts.sql

-- -----------------------------------------------------
-- Trigger for `likes_count` on `posts` table
-- -----------------------------------------------------

-- Function to increment likes_count on posts when a new like is inserted
CREATE OR REPLACE FUNCTION increment_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE post_id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call increment_post_likes_count after each INSERT on the likes table
CREATE TRIGGER trg_increment_post_likes_count
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION increment_post_likes_count();


-- Function to decrement likes_count on posts when a like is deleted
CREATE OR REPLACE FUNCTION decrement_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts
    SET likes_count = likes_count - 1
    WHERE post_id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call decrement_post_likes_count after each DELETE on the likes table
CREATE TRIGGER trg_decrement_post_likes_count
AFTER DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION decrement_post_likes_count();


-- -----------------------------------------------------
-- Trigger for `comments_count` on `posts` table
-- -----------------------------------------------------

-- Function to increment comments_count on posts when a new comment is inserted
CREATE OR REPLACE FUNCTION increment_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts
    SET comments_count = comments_count + 1
    WHERE post_id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call increment_post_comments_count after each INSERT on the comments table
CREATE TRIGGER trg_increment_post_comments_count
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION increment_post_comments_count();


-- Function to decrement comments_count on posts when a comment is deleted
CREATE OR REPLACE FUNCTION decrement_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts
    SET comments_count = comments_count - 1
    WHERE post_id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call decrement_post_comments_count after each DELETE on the comments table
CREATE TRIGGER trg_decrement_post_comments_count
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION decrement_post_comments_count();