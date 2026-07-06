const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_LnsP12wBZWFN@ep-muddy-dream-a1jbyn5l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
async function run() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT
        CASE WHEN $2::int IS NOT NULL
             THEN EXISTS (SELECT 1 FROM likes WHERE post_id = 1 AND user_id = $2::int)
             ELSE false
        END AS user_has_liked
    `, [1, null]);
    console.log("Success:", res.rows);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}
run();
