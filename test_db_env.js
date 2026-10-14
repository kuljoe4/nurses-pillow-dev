import dotenv from 'dotenv';
dotenv.config();
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  console.log('Host:', url.host);
  console.log('Port:', url.port);
  console.log('DB:', url.pathname);
}
