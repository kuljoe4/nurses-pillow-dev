-- Nurses Pillow Relational Database Schema (Railway PostgreSQL)

-- Enable VARCHAR(255) extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('nurse', 'host', 'admin')),
  legal_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  stripe_customer_id VARCHAR(255),
  stripe_connect_account_id VARCHAR(255),
  verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  health_system VARCHAR(255),
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  trauma_level VARCHAR(100),
  teaching_hospital BOOLEAN DEFAULT FALSE,
  shift_types JSONB, -- Array of strings
  parking_type VARCHAR(255),
  nurse_feedback_score INTEGER CHECK (nurse_feedback_score >= 0 AND nurse_feedback_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LISTINGS TABLE
CREATE TABLE IF NOT EXISTS listings (
  id VARCHAR(255) PRIMARY KEY,
  host_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  cancellation_tier VARCHAR(50) NOT NULL CHECK (cancellation_tier IN ('flexible_30d', 'moderate_60d', 'strict_90d')),
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  nearest_hospital_id VARCHAR(255) REFERENCES hospitals(id) ON DELETE SET NULL,
  monthly_rate DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2) NOT NULL,
  cleaning_fee DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROOMS TABLE (For multi-room configs within a listing)
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(255) PRIMARY KEY,
  listing_id VARCHAR(255) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  room_name VARCHAR(255) NOT NULL,
  bed_type VARCHAR(50) NOT NULL,
  private_bath BOOLEAN DEFAULT FALSE,
  dedicated_workspace BOOLEAN DEFAULT FALSE,
  blackout_curtains BOOLEAN DEFAULT FALSE,
  white_noise_machine BOOLEAN DEFAULT FALSE,
  monthly_rate_override DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRICING_CALENDAR TABLE
CREATE TABLE IF NOT EXISTS pricing_calendar (
  id VARCHAR(255) PRIMARY KEY,
  listing_id VARCHAR(255) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rate DECIMAL(10, 2) NOT NULL,
  minimum_stay_weeks INTEGER NOT NULL DEFAULT 13,
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(255) PRIMARY KEY,
  listing_id VARCHAR(255) NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  traveler_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('requested', 'accepted', 'declined', 'paid', 'upcoming', 'active', 'completed', 'cancelled')),
  total_traveler_charged DECIMAL(10, 2) NOT NULL,
  host_net_payout DECIMAL(10, 2) NOT NULL,
  platform_fee_amount DECIMAL(10, 2) NOT NULL,
  security_deposit_hold DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  record_id VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  actor VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_hospitals_modtime BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_listings_modtime BEFORE UPDATE ON listings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_rooms_modtime BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_pricing_calendar_modtime BEFORE UPDATE ON pricing_calendar FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
