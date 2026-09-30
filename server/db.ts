import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { railwayDb } from './railwayDb.js';

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

        // Ensure reset password & verification columns exist
        await railwayDb.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
          ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS dob VARCHAR(20),
          ADD COLUMN IF NOT EXISTS last_four_ssn VARCHAR(4),
          ADD COLUMN IF NOT EXISTS id_document_name VARCHAR(255),
          ADD COLUMN IF NOT EXISTS clinical_license_number VARCHAR(100),
          ADD COLUMN IF NOT EXISTS clinical_state_board VARCHAR(100),
          ADD COLUMN IF NOT EXISTS profession_specialty VARCHAR(150),
          ADD COLUMN IF NOT EXISTS clinical_document_url TEXT,
          ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified';
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

        // Bootstrap Cleared States & Multi-State Inventory dynamically
        await bootstrapClearedStatesAndInventory((sql, params) => railwayDb.query(sql, params));
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

        // Ensure reset password & verification columns exist
        await pool.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
          ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS dob VARCHAR(20),
          ADD COLUMN IF NOT EXISTS last_four_ssn VARCHAR(4),
          ADD COLUMN IF NOT EXISTS id_document_name VARCHAR(255),
          ADD COLUMN IF NOT EXISTS clinical_license_number VARCHAR(100),
          ADD COLUMN IF NOT EXISTS clinical_state_board VARCHAR(100),
          ADD COLUMN IF NOT EXISTS profession_specialty VARCHAR(150),
          ADD COLUMN IF NOT EXISTS clinical_document_url TEXT,
          ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified';
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

        // Bootstrap Cleared States & Multi-State Inventory dynamically
        await bootstrapClearedStatesAndInventory((sql, params) => pool!.query(sql, params));
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

async function bootstrapClearedStatesAndInventory(runQuery: (text: string, params?: any[]) => Promise<any>) {
  try {
    // 1. Cleared States Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS cleared_states (
        code VARCHAR(2) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        capital VARCHAR(100) NOT NULL,
        hospitals_count_label VARCHAR(50) NOT NULL,
        status VARCHAR(100) NOT NULL,
        is_launch_hub BOOLEAN DEFAULT FALSE,
        sample_cities VARCHAR(255),
        sanctuary_highlights TEXT,
        top_facilities TEXT[],
        center_x INTEGER NOT NULL,
        center_y INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        cleared_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Seed / Upsert Cleared States
    await runQuery(`
      INSERT INTO cleared_states (code, name, capital, hospitals_count_label, status, is_launch_hub, sample_cities, sanctuary_highlights, top_facilities, center_x, center_y, is_active)
      VALUES
        ('NC', 'North Carolina', 'Raleigh', '110+', 'Primary Launch Hub', true, 'Durham / Raleigh / Chapel Hill', 'Verified day-sleeper suites near Duke Health and UNC Research Triangle.', ARRAY['Duke University Hospital (Durham)', 'UNC Medical Center (Chapel Hill)', 'WakeMed Raleigh Campus', 'Atrium Health Carolinas Medical Center'], 805, 345, true),
        ('MD', 'Maryland', 'Annapolis', '45+', 'Cleared & Active', false, 'Baltimore / Bethesda / Silver Spring', 'Acoustically insulated housing along the Baltimore clinical corridor.', ARRAY['The Johns Hopkins Hospital (Baltimore)', 'University of Maryland Medical Center', 'MedStar Health'], 825, 285, true),
        ('CT', 'Connecticut', 'Hartford', '32+', 'Cleared & Active', false, 'New Haven / Hartford / Stamford', 'Blackout-certified furnished homes minutes from Yale New Haven.', ARRAY['Yale New Haven Hospital', 'Hartford Hospital', 'Stamford Hospital'], 890, 220, true),
        ('ND', 'North Dakota', 'Bismarck', '28+', 'Cleared & Active', false, 'Fargo / Grand Forks / Bismarck', 'High-thermal-comfort winterized apartments with heated garage bays.', ARRAY['Sanford Medical Center (Fargo)', 'Altru Health System (Grand Forks)', 'CHI St. Alexius Health'], 450, 155, true),
        ('KS', 'Kansas', 'Topeka', '50+', 'Cleared & Active', false, 'Kansas City / Wichita / Topeka', 'Turnkey $0-deposit homes equipped with scrub washers and blackout drapes.', ARRAY['The University of Kansas Health System (Kansas City)', 'Ascension Via Christi St. Francis (Wichita)', 'Stormont Vail Health'], 490, 320, true)
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        capital = EXCLUDED.capital,
        hospitals_count_label = EXCLUDED.hospitals_count_label,
        status = EXCLUDED.status,
        is_launch_hub = EXCLUDED.is_launch_hub,
        sample_cities = EXCLUDED.sample_cities,
        sanctuary_highlights = EXCLUDED.sanctuary_highlights,
        top_facilities = EXCLUDED.top_facilities,
        center_x = EXCLUDED.center_x,
        center_y = EXCLUDED.center_y,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    `);

    // 3. Ensure Healthcare Facilities for all Cleared States exist in DB
    await runQuery(`
      INSERT INTO healthcare_facilities (id, name, health_system, address_line1, city, state, postal_code, latitude, longitude, trauma_level, teaching_hospital, parking_type, nurse_feedback_score)
      VALUES
        ('h-jhu', 'The Johns Hopkins Hospital', 'Johns Hopkins Medicine', '1800 Orleans St', 'Baltimore', 'MD', '21287', 39.2969, -76.5927, 'Level I Adult & Pediatric Trauma Center', true, 'McElderry Dedicated Staff Garage / Free Shuttle', 99),
        ('h-ummc', 'University of Maryland Medical Center', 'University of Maryland Medical System', '22 S Greene St', 'Baltimore', 'MD', '21201', 39.2882, -76.6231, 'Level I Adult & Shock Trauma Center', true, 'Pratt Street Garage w/ 24/7 Security Escort', 98),
        ('h-yale', 'Yale New Haven Hospital', 'Yale New Haven Health', '20 York St', 'New Haven', 'CT', '06510', 41.3040, -72.9360, 'Level I Adult & Pediatric Trauma Center', true, 'Air Rights Garage & Free Clinical Shuttle', 99),
        ('h-hartford', 'Hartford Hospital', 'Hartford HealthCare', '80 Seymour St', 'Hartford', 'CT', '06102', 41.7533, -72.6789, 'Level I Trauma & Regional Burn Center', true, 'Jefferson Street Staff Garage', 96),
        ('h-sanford', 'Sanford Medical Center Fargo', 'Sanford Health', '5225 23rd Ave S', 'Fargo', 'ND', '58104', 46.8524, -96.8622, 'Level I Adult Trauma Center', true, 'Heated Clinical Staff Ramp', 98),
        ('h-altru', 'Altru Health System', 'Altru Health', '1200 S Columbia Rd', 'Grand Forks', 'ND', '58201', 47.9152, -97.0652, 'Level II Trauma Center', true, 'Reserved Clinical Surface & Winter Plug-in Decks', 95),
        ('h-kumed', 'The University of Kansas Health System', 'The University of Kansas Health System', '3901 Rainbow Blvd', 'Kansas City', 'KS', '66160', 39.0620, -94.6092, 'Level I Trauma & Comprehensive Burn Center', true, 'Bluff Staff Garage & Clinical Badge Express', 98),
        ('h-ascension', 'Ascension Via Christi St. Francis', 'Ascension Health', '929 N St Francis', 'Wichita', 'KS', '67214', 37.6978, -97.3278, 'Level I Trauma & Regional Burn Center', true, 'Murdock Staff Deck w/ 24/7 Security Patrol', 97)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Ensure Verified Listings for all Cleared States exist in DB
    await runQuery(`
      INSERT INTO listings (id, host_id, title, description, address_line1, city, state, postal_code, latitude, longitude, nearest_hospital_id, monthly_rent, security_deposit_amount, cleaning_fee, is_published, is_verified_by_admin)
      VALUES
        ('md-hopkins-loft', 'host-sarah-m', 'Historic Fells Point Clinician Retreat', 'Acoustically insulated retreat near Johns Hopkins.', 'Fells Point Maritime Way', 'Baltimore', 'MD', '21231', 39.2830, -76.5910, 'h-jhu', 2250.00, 0.00, 150.00, true, true),
        ('md-ummc-studio', 'host-karen-b', 'Inner Harbor Acoustic Medical Suite', 'Quiet daytime suite minutes from UMMC.', 'Pratt St Medical Hub', 'Baltimore', 'MD', '21201', 39.2860, -76.6190, 'h-ummc', 1850.00, 0.00, 120.00, true, true),
        ('ct-yale-haven', 'host-james-l', 'East Rock Day-Sleeper Flat near Yale', 'Blackout drapes and quiet hours verified for Yale New Haven clinicians.', 'Orange St Residential Corridor', 'New Haven', 'CT', '06511', 41.3120, -72.9230, 'h-yale', 2150.00, 0.00, 140.00, true, true),
        ('ct-hartford-suite', 'host-sarah-m', 'Capitol West Clinician Residence', 'Sanctuary flat near Hartford Hospital.', 'Jefferson St Clinical Deck', 'Hartford', 'CT', '06106', 41.7610, -72.6840, 'h-hartford', 1900.00, 0.00, 130.00, true, true),
        ('nd-sanford-haven', 'host-karen-b', 'Prairie Quiet Day-Sleeper Sanctuary', 'Heated garage and day-sleeper soundproofing for Sanford Fargo staff.', '23rd Ave S Medical Corridor', 'Fargo', 'ND', '58104', 46.8570, -96.8560, 'h-sanford', 1650.00, 0.00, 100.00, true, true),
        ('nd-altru-loft', 'host-james-l', 'Red River Valley Clinician Flat', 'Thermal insulation and scrub washer near Altru Health.', 'Columbia Rd Medical Park', 'Grand Forks', 'ND', '58201', 47.9190, -97.0590, 'h-altru', 1550.00, 0.00, 95.00, true, true),
        ('ks-kumed-haven', 'host-sarah-m', 'Westwood Quiet Retreat near KU Med', 'Day-sleeper certified apartment minutes from KU Medical Center.', 'Rainbow Blvd Clinical Arts', 'Kansas City', 'KS', '66160', 39.0560, -94.6130, 'h-kumed', 1750.00, 0.00, 110.00, true, true),
        ('ks-ascension-studio', 'host-karen-b', 'Old Town Wichita Clinician Studio', 'Quiet hours guaranteed for Ascension Via Christi hospital staff.', 'St Francis Ave Clinical Arts', 'Wichita', 'KS', '67214', 37.6920, -97.3320, 'h-ascension', 1450.00, 0.00, 90.00, true, true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('[PostgreSQL] Cleared states & multi-state inventory bootstrapped successfully.');
  } catch (err: any) {
    console.warn('[PostgreSQL] Cleared states bootstrap notice:', err.message);
  }
}
