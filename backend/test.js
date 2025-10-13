import { query } from './config/db.js';

async function testConnection() {
  try {
    // Run a simple query to check the connection
    const res = await query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('🕒 Server time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', err.message);
  } finally {
    process.exit(); // Exit after test
  }
}

testConnection();