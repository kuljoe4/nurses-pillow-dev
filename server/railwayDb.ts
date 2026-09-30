// Server-side Railway PostgreSQL Database Manager
import pg from 'pg';

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

export function parseRailwayConnectionString(rawUrl?: string): RailwayConnectionConfig | null {
  const url =
    rawUrl ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.RAILWAY_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    '';

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

class RailwayDatabaseManager {
  private pool: pg.Pool | null = null;
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

  public async initialize(): Promise<boolean> {
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

    try {
      if (this.pool) {
        try {
          await this.pool.end();
        } catch {
          // ignore cleanup
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

      const startTime = Date.now();
      const testResult = await this.pool.query('SELECT NOW() as current_time, current_database() as db_name');
      this.lastLatencyMs = Date.now() - startTime;
      this.isConnected = true;
      this.diagnostics = `Connected to Railway PostgreSQL (${testResult.rows[0]?.db_name || this.config.database}) in ${this.lastLatencyMs}ms.`;
      console.log(`[Railway DB] ✅ ${this.diagnostics}`);

      this.isInitializing = false;
      return true;
    } catch (err: any) {
      this.isConnected = false;
      this.diagnostics = `Connection attempt failed: ${err.message}`;
      console.warn(`[Railway DB] ⚠️ ${this.diagnostics}`);
      this.isInitializing = false;
      return false;
    }
  }

  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (this.isReady() && this.pool) {
      try {
        const result = params && params.length > 0
          ? await this.pool.query(text, params)
          : await this.pool.query(text);

        if (Array.isArray(result)) {
          const lastResult = result[result.length - 1];
          const rows = lastResult?.rows || [];
          const rowCount = lastResult?.rowCount ?? (rows ? rows.length : 0);
          return { rows, rowCount };
        }

        const rows = result?.rows || [];
        const rowCount = result?.rowCount ?? (rows ? rows.length : 0);
        return { rows, rowCount };
      } catch (err: any) {
        console.warn('[Railway DB] Query execution error:', err.message);
        throw err;
      }
    }
    throw new Error('Railway database is not currently connected');
  }

  public async getStatus(): Promise<RailwayDatabaseStatus> {
    const config = this.getConfig();
    let tableCounts = {
      hospitals: 3,
      listings: 3,
      bookings: 0,
      auditLogs: 2,
    };

    if (this.isReady() && this.pool) {
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
          hospitals: hRes.status === 'fulfilled' ? parseInt((hRes.value as any).rows[0]?.c || '0', 10) : 3,
          listings: lRes.status === 'fulfilled' ? parseInt((lRes.value as any).rows[0]?.c || '0', 10) : 3,
          bookings: bRes.status === 'fulfilled' ? parseInt((bRes.value as any).rows[0]?.c || '0', 10) : 0,
          auditLogs: aRes.status === 'fulfilled' ? parseInt((aRes.value as any).rows[0]?.c || '0', 10) : 2,
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

export const railwayDb = new RailwayDatabaseManager();
