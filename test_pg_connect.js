import pg from 'pg';
async function test() {
  const url = "postgresql://postgres:OppuhxwyUcyAfvjewBGyzvSSAgIZTLbj@altaria.proxy.rlwy.net:56487/railway";
  const pool = new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
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
