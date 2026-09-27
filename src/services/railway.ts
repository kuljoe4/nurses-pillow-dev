// Nurses Pillow - Railway PostgreSQL Production Database Service
// Implements connection parsing, SSL pooling, schema migration, and seed synchronization
// Prioritizes production Railway PostgreSQL over the local in-memory fallback store.

import { NC_HOSPITAL_SEEDS, NC_LISTING_SEEDS } from './database';

export interface RailwayConnectionConfig {
  connectionString: string;
  host: string;
  port: number;
  database: string;
  user: string;
  ssl: boolean;
  isInternalNetwork: boolean;
  isPublicProxy: boolean;
}

export interface RailwayDatabaseStatus {
  isConnected: boolean;
  provider: 'Railway PostgreSQL';
  activeStore: 'production_railway' | 'disconnected';
  host: string;
  port: number;
  database: string;
  latencyMs: number | null;
  tableCounts: {
    hospitals: number;
    listings: number;
    bookings: number;
    auditLogs: number;
  };
  diagnostics: string;
  lastChecked: string;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// 1. Connection String Parsing & Sanitization
export function parseRailwayConnectionString(rawUrl?: string): RailwayConnectionConfig | null {
  const url =
    rawUrl ||
    (typeof process !== 'undefined'
      ? process.env.DATABASE_URL ||
        process.env.DATABASE_PUBLIC_URL ||
        process.env.RAILWAY_DATABASE_URL ||
        process.env.POSTGRES_URL
      : '');

  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    const database = parsed.pathname.replace(/^\//, '') || 'railway';
    const user = parsed.username || 'postgres';

    const isInternalNetwork = host.includes('railway.internal');
    const isPublicProxy = host.includes('rlwy.net') || host.includes('railway.app');
    const ssl = isPublicProxy || parsed.searchParams.get('sslmode') === 'require' || host !== 'localhost';

    return {
      connectionString: url,
      host,
      port,
      database,
      user,
      ssl,
      isInternalNetwork,
      isPublicProxy,
    };
  } catch {
    return null;
  }
}

// 2. Server-Side Railway Database Connection Manager
class RailwayDatabaseManager {
  private pool: any = null;
  private isConnected = false;
  private isInitializing = false;
  private lastLatencyMs: number | null = null;
  private config: RailwayConnectionConfig | null = null;
  private diagnostics = 'Awaiting connection attempt';

  constructor() {
    this.refreshConfig();
  }

  public refreshConfig() {
    this.config = parseRailwayConnectionString();
  }

  public getConfig(): RailwayConnectionConfig | null {
    if (!this.config) {
      this.refreshConfig();
    }
    return this.config;
  }

  public isReady(): boolean {
    return this.isConnected && this.pool !== null;
  }

  /**
   * Initializes the PostgreSQL connection pool to Railway
   * Supported in Node.js runtime environments
   */
  public async initialize(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      return false; // Browser runtime uses API endpoints
    }

    if (this.isInitializing) return this.isConnected;
    this.isInitializing = true;
    this.refreshConfig();

    if (!this.config) {
      this.diagnostics = 'No DATABASE_URL configured in environment variables.';
      this.isConnected = false;
      this.isInitializing = false;
      console.log(`[Railway DB] ${this.diagnostics} (Using in-memory store)`);
      return false;
    }

    // Diagnostic notice for internal Railway DNS from external containers
    if (this.config.isInternalNetwork) {
      this.diagnostics =
        `Detected Railway private internal domain (${this.config.host}). ` +
        `Railway internal DNS is only accessible when running inside Railway's private network. ` +
        `For external services (e.g. Google Cloud / AI Studio), use Railway's Public TCP Proxy URL ` +
        `(e.g. postgresql://postgres:***@roundhouse.proxy.rlwy.net:PORT/railway).`;
      console.warn(`[Railway DB] Notice: ${this.diagnostics}`);
    }

    try {
      // Dynamic import of pg to ensure clean Vite client-side bundle isolation
      const pgModule = await import(/* @vite-ignore */ 'pg');
      const pg = pgModule.default || pgModule;

      if (this.pool) {
        try {
          await this.pool.end();
        } catch {
          // ignore cleanup errors
        }
      }

      this.pool = new pg.Pool({
        connectionString: this.config.connectionString,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000,
        max: 10,
        idleTimeoutMillis: 30000,
      });

      this.pool.on('error', (err: any) => {
        console.warn('[Railway DB] Pool client background error:', err.message);
        this.isConnected = false;
        this.diagnostics = `Background error: ${err.message}`;
      });

      // Test connection with a fast ping
      const startTime = Date.now();
      const testResult = await this.pool.query('SELECT NOW() as current_time, current_database() as db_name');
      this.lastLatencyMs = Date.now() - startTime;
      this.isConnected = true;
      this.diagnostics = `Connected to Railway PostgreSQL (${testResult.rows[0]?.db_name || this.config.database}) in ${this.lastLatencyMs}ms.`;
      console.log(`[Railway DB] ✅ ${this.diagnostics}`);

      // Auto-migrate schema & seed initial North Carolina inventory
      await this.autoBootstrapSchemaAndSeeds();

      this.isInitializing = false;
      return true;
    } catch (err: any) {
      this.isConnected = false;
      this.diagnostics = `Connection attempt failed: ${err.message}`;
      console.warn(`[Railway DB] ⚠️ ${this.diagnostics} — Application continuing with in-memory fallback store.`);
      this.isInitializing = false;
      return false;
    }
  }

  /**
   * Automatically creates standard tables if not present and seeds initial NC hospital inventory
   */
  private async autoBootstrapSchemaAndSeeds() {
    if (!this.pool || !this.isConnected) return;

    try {
      // 1. Ensure extensions and core tables exist
      await this.pool.query(`
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        CREATE TABLE IF NOT EXISTS healthcare_facilities (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          health_system VARCHAR(255),
          address_line1 VARCHAR(255) NOT NULL,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(2) NOT NULL DEFAULT 'NC',
          postal_code VARCHAR(20) NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          place_id VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          trauma_level VARCHAR(100),
          teaching_hospital BOOLEAN DEFAULT FALSE,
          parking_type VARCHAR(255),
          nurse_feedback_score INTEGER DEFAULT 95,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          role VARCHAR(50) NOT NULL DEFAULT 'nurse',
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          phone_number VARCHAR(30),
          email_verified BOOLEAN DEFAULT FALSE,
          phone_verified BOOLEAN DEFAULT FALSE,
          is_nurse_verified BOOLEAN DEFAULT FALSE,
          is_host_verified BOOLEAN DEFAULT FALSE,
          stripe_connected_account_id VARCHAR(100),
          stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS listings (
          id VARCHAR(255) PRIMARY KEY,
          host_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          property_type VARCHAR(50) DEFAULT 'entire_home',
          address_line1 VARCHAR(255) NOT NULL,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(2) NOT NULL DEFAULT 'NC',
          postal_code VARCHAR(20) NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          nearest_hospital_id VARCHAR(255),
          monthly_rent DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          security_deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
          cleaning_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          pet_fee DECIMAL(10, 2) DEFAULT 0.00,
          cancellation_policy VARCHAR(50) DEFAULT 'flexible',
          is_active BOOLEAN DEFAULT TRUE,
          is_published BOOLEAN DEFAULT TRUE,
          is_verified_by_admin BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Ensure backward-compatible columns exist if table was previously created
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS cancellation_policy VARCHAR(50) DEFAULT 'flexible';
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS pet_fee DECIMAL(10, 2) DEFAULT 0.00;

        CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(255) PRIMARY KEY,
          listing_id VARCHAR(255) NOT NULL,
          traveler_user_id VARCHAR(255) NOT NULL,
          check_in_date DATE NOT NULL,
          check_out_date DATE NOT NULL,
          duration_weeks INTEGER NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'requested',
          total_rent DECIMAL(10, 2) NOT NULL,
          base_monthly_rent DECIMAL(10, 2) NOT NULL,
          gross_booking_value DECIMAL(10, 2) NOT NULL,
          host_platform_fee_amount DECIMAL(10, 2) NOT NULL,
          host_payout_amount DECIMAL(10, 2) NOT NULL,
          cancellation_policy_agreed VARCHAR(50) DEFAULT 'flexible',
          host_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(255) PRIMARY KEY,
          event_type VARCHAR(100) NOT NULL,
          record_id VARCHAR(255) NOT NULL,
          details TEXT NOT NULL,
          actor VARCHAR(255) NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );

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

      // 2. Check if facilities table needs initial seeding
      const countRes = await this.pool.query('SELECT COUNT(*) as count FROM healthcare_facilities');
      const count = parseInt(countRes.rows[0]?.count || '0', 10);

      if (count === 0) {
        console.log('[Railway DB] Seeding initial North Carolina hospital facilities and listings into Railway...');

        for (const h of NC_HOSPITAL_SEEDS) {
          await this.pool.query(
            `INSERT INTO healthcare_facilities (id, name, health_system, address_line1, city, state, postal_code, latitude, longitude, trauma_level, teaching_hospital, parking_type, nurse_feedback_score)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             ON CONFLICT (id) DO NOTHING;`,
            [h.id, h.name, h.health_system, h.address, h.city, h.state, h.zip, h.latitude, h.longitude, h.trauma_level, h.teaching_hospital, h.parking_type, h.nurse_feedback_score]
          );
        }

        for (const l of NC_LISTING_SEEDS) {
          await this.pool.query(
            `INSERT INTO listings (id, host_id, title, description, address_line1, city, state, postal_code, latitude, longitude, nearest_hospital_id, monthly_rent, security_deposit_amount, cleaning_fee, is_active, is_verified_by_admin)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (id) DO NOTHING;`,
            [l.id, l.host_id, l.title, 'Curated peaceful sanctuary for clinicians.', l.address, l.city, l.state, l.zip, l.latitude, l.longitude, l.nearest_hospital_id, l.monthly_rate, l.security_deposit, l.cleaning_fee, l.is_active, true]
          );
        }
        console.log('[Railway DB] ✅ Initial seed sync to Railway complete.');
      }
    } catch (err: any) {
      console.warn('[Railway DB] Schema auto-bootstrap notice:', err.message);
    }
  }

  /**
   * Executes a SQL query against Railway with automatic fallback handling
   */
  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (this.isReady()) {
      try {
        const result = params && params.length > 0
          ? await this.pool.query(text, params)
          : await this.pool.query(text);

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
        console.warn('[Railway DB] Query execution error:', err.message);
        throw err;
      }
    }
    throw new Error('Railway database is not currently connected');
  }

  /**
   * Fetches detailed connection diagnostics and table statistics
   */
  public async getStatus(): Promise<RailwayDatabaseStatus> {
    const config = this.getConfig();
    let tableCounts = {
      hospitals: 3,
      listings: 3,
      bookings: 0,
      auditLogs: 2,
    };

    if (this.isReady()) {
      try {
        const t0 = Date.now();
        await this.pool.query('SELECT 1');
        this.lastLatencyMs = Date.now() - t0;

        const [hRes, lRes, bRes, aRes] = await Promise.allSettled([
          this.pool.query('SELECT COUNT(*) as c FROM healthcare_facilities'),
          this.pool.query('SELECT COUNT(*) as c FROM listings'),
          this.pool.query('SELECT COUNT(*) as c FROM bookings'),
          this.pool.query('SELECT COUNT(*) as c FROM audit_logs'),
        ]);

        tableCounts = {
          hospitals: hRes.status === 'fulfilled' ? parseInt(hRes.value.rows[0]?.c || '0', 10) : 3,
          listings: lRes.status === 'fulfilled' ? parseInt(lRes.value.rows[0]?.c || '0', 10) : 3,
          bookings: bRes.status === 'fulfilled' ? parseInt(bRes.value.rows[0]?.c || '0', 10) : 0,
          auditLogs: aRes.status === 'fulfilled' ? parseInt(aRes.value.rows[0]?.c || '0', 10) : 2,
        };
      } catch {
        this.isConnected = false;
      }
    }

    return {
      isConnected: this.isConnected,
      provider: 'Railway PostgreSQL',
      activeStore: this.isConnected ? 'production_railway' : 'disconnected',
      host: config ? config.host : 'unconfigured',
      port: config ? config.port : 5432,
      database: config ? config.database : 'railway',
      latencyMs: this.lastLatencyMs,
      tableCounts,
      diagnostics: this.diagnostics,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Global server-side instance
export const railwayDb = new RailwayDatabaseManager();

// 3. Client-Side Service (Browser / Frontend Safe)
export const railwayClient = {
  /**
   * Fetches the live connection status of the Railway production database
   */
  async getStatus(): Promise<RailwayDatabaseStatus> {
    try {
      const response = await fetch('/api/railway/status');
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (err: any) {
      return {
        isConnected: false,
        provider: 'Railway PostgreSQL',
        activeStore: 'disconnected',
        host: 'unreachable',
        port: 5432,
        database: 'railway',
        latencyMs: null,
        tableCounts: { hospitals: 0, listings: 0, bookings: 0, auditLogs: 0 },
        diagnostics: `Frontend status query failed: ${err.message}`,
        lastChecked: new Date().toISOString(),
      };
    }
  },

  /**
   * Triggers a live reconnection test from the frontend
   */
  async reconnect(): Promise<RailwayDatabaseStatus> {
    try {
      const response = await fetch('/api/railway/reconnect', { method: 'POST' });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch {
      return this.getStatus();
    }
  },
};
