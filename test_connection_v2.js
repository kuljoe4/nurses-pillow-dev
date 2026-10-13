import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Print sanitized URL to ensure it's picked up correctly
const url = process.env.DATABASE_URL;
console.log('Testing URL:', url ? url.replace(/:[^:@]+@/, ':***@') : 'MISSING');

async function test() {
  if (!url) return;
  const pool = new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  
  try {
    const client = await pool.connect();
    console.log('SUCCESS: Connected!');
    client.release();
  } catch (e) {
    console.error('FAILURE:', e.message);
  } finally {
    await pool.end();
  }
}
test();
