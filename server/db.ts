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
  query: async (text: string, params?: any[]): Promise<any> => {
    // 1. Primary: Railway Database Manager
    if (railwayDb.isReady()) {
      return await railwayDb.query(text, params);
    }

    // 2. Direct PostgreSQL Pool
    if (pool) {
      try {
        const result = params && params.length > 0
          ? await pool.query(text, params)
          : await pool.query(text);
        pgConnected = true;
        lastConnectionError = null;

        if (Array.isArray(result)) {
          const lastResult = result[result.length - 1];
          const rows = lastResult?.rows || [];
          const rowCount = lastResult?.rowCount ?? (rows ? rows.length : 0);
          return {
            rows,
            rowCount,
          };
        }

        const rows = result?.rows || [];
        const rowCount = result?.rowCount ?? (rows ? rows.length : 0);
        return {
          rows,
          rowCount,
        };
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
        // Ensure extensions exist
        await railwayDb.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        // Ensure reset password columns exist
        await railwayDb.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
          ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;
        `);
        // Ensure favorites table and indexes exist
        await railwayDb.query(`
          CREATE TABLE IF NOT EXISTS favorites (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            listing_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT uq_favorites_user_listing UNIQUE (user_id, listing_id)
          );
          CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
          CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);
        `);
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

        await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        // Ensure reset password columns exist
        await pool.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
          ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;
        `);

        // Ensure favorites table and indexes exist
        await pool.query(`
          CREATE TABLE IF NOT EXISTS favorites (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            listing_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT uq_favorites_user_listing UNIQUE (user_id, listing_id)
          );
          CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
          CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);
        `);
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
