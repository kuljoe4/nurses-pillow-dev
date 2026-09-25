import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { railwayDb } from '../src/services/railway.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool: pg.Pool | null = null;
let pgConnected = false;
let lastConnectionError: string | null = null;

// Initialize Postgres pool only with real connection string
if (process.env.DATABASE_URL) {
  try {
    const isRemoteDb =
      process.env.NODE_ENV === 'production' ||
      process.env.DATABASE_URL.includes('rlwy.net') ||
      process.env.DATABASE_URL.includes('railway') ||
      process.env.DATABASE_URL.includes('supabase') ||
      process.env.DATABASE_URL.includes('neon.tech') ||
      process.env.DATABASE_URL.includes('sslmode=require');

    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Database pool background error:', err.message);
      pgConnected = false;
      lastConnectionError = err.message;
    });

    // Test connection asynchronously
    pool
      .query('SELECT NOW() as current_time')
      .then((res) => {
        pgConnected = true;
        lastConnectionError = null;
        console.log(`[PostgreSQL] ✅ Connected to live database at ${res.rows[0]?.current_time}`);
      })
      .catch((err) => {
        pgConnected = false;
        lastConnectionError = err.message;
        console.error(`[PostgreSQL] ❌ Database connection failed: ${err.message}`);
      });
  } catch (err: any) {
    console.error('[PostgreSQL] Database pool initialization error:', err.message);
    lastConnectionError = err.message;
    pool = null;
  }
}

export const db = {
  /**
   * Executes a query against the live PostgreSQL database.
   * STRICT: No in-memory fallback. Throws error if database is unavailable.
   */
  query: async (text: string, params: any[] = []): Promise<any> => {
    // 1. Primary: Railway Database Manager
    if (railwayDb.isReady()) {
      return await railwayDb.query(text, params);
    }

    // 2. Direct PostgreSQL Pool
    if (pool) {
      try {
        const result = await pool.query(text, params);
        pgConnected = true;
        lastConnectionError = null;
        return result;
      } catch (err: any) {
        console.error('[PostgreSQL] Query execution error:', err.message);
        throw err;
      }
    }

    const errorMsg =
      lastConnectionError ||
      'No active PostgreSQL database connection. Verify DATABASE_URL in environment variables.';
    console.error(`[PostgreSQL] ${errorMsg}`);
    throw new Error(`Database Error: ${errorMsg}`);
  },

  /**
   * Initializes the database schema using server/schema.sql on the live PostgreSQL instance.
   */
  initDb: async () => {
    try {
      // 1. Try Railway initialization
      const railwayOk = await railwayDb.initialize();
      if (railwayOk) {
        console.log('[PostgreSQL] Railway production database initialized and active.');
        return;
      }

      // 2. Direct pool migration
      if (pool) {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schema = fs.readFileSync(schemaPath, 'utf8');
          await pool.query(schema);
          console.log('[PostgreSQL] Database schema initialized successfully from schema.sql');
        }
      } else {
        console.warn(`[PostgreSQL] Live database not yet connected: ${lastConnectionError || 'DATABASE_URL pending'}`);
      }
    } catch (error: any) {
      console.warn('[PostgreSQL] Schema initialization warning:', error.message);
    }
  },

  getStatus: async () => {
    return railwayDb.getStatus();
  },

  isConnected: () => pgConnected || railwayDb.isReady(),
  getLastError: () => lastConnectionError,
};
