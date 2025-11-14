const cron = require('node-cron');
const db = require('../db/db');
const cloudinary = require('../db/cloudinary');

// Run every midnight → adjust timing as needed
cron.schedule("0 0 * * *", async () => {
  console.log("🕒 Running story cleanup job...");

  try {
    // Step 1: Get expired stories
    const { rows: expiredStories } = await db.query(
      `SELECT story_id, cloudinary_public_id FROM stories WHERE expires_at < NOW()`
    );

    if (expiredStories.length === 0) {
      console.log("✅ No expired stories found.");
      return;
    }

    console.log(`⚙️ Found ${expiredStories.length} expired stories.`);

    // Step 2: Delete each expired story from Cloudinary and DB
    for (const story of expiredStories) {
      const { story_id, cloudinary_public_id } = story;

      try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(cloudinary_public_id);
        console.log(`🗑️ Deleted Cloudinary media: ${cloudinary_public_id}`);

        // Delete from DB
        await db.query(`DELETE FROM stories WHERE story_id = $1`, [story_id]);
        console.log(`✅ Removed story with id: ${story_id}`);
      } catch (err) {
        console.error(`❌ Error deleting story ${story_id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});
