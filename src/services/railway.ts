// Nurses Pillow - Client-Safe Railway PostgreSQL Status Service
// Communicates with backend Express API for PostgreSQL health & live status

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

// Client-Side Service (Browser / Frontend Safe)
export const railwayClient = {
  /**
   * Fetches the live connection status of the Railway production database from backend proxy
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
        diagnostics: `Frontend status query notice: ${err?.message || 'Offline'}`,
        lastChecked: new Date().toISOString(),
      };
    }
  },

  /**
   * Triggers a live reconnection test from the frontend via the backend proxy
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
