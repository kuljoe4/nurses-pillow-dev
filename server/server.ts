import express from 'express';
import { db } from './db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './authRoutes.js';
import { mapDbListingToFrontend } from './mapper.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.use('/api/auth', authRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nurses Pillow API is running' });
});

// Endpoint to fetch hospitals
app.get('/api/hospitals', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, health_system, address_line1 as address, city, state, postal_code as zip,
      latitude, longitude, trauma_level, teaching_hospital, parking_type, nurse_feedback_score
      FROM healthcare_facilities
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch listings
app.get('/api/listings', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, host_id, title, property_type, address_line1 as address, city, state, postal_code as zip,
      latitude, longitude, nearest_hospital_id, monthly_rent as monthly_rate, security_deposit_amount as security_deposit,
      cleaning_fee, is_published as is_active, cancellation_policy as cancellation_tier, pet_fee
      FROM listings
    `);

    // Send standard structure the frontend models expect right now to avoid rewrite of 100 components.
    const mapped = result.rows.map(mapDbListingToFrontend);
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to create bookings
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = req.body;

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, full_name, is_nurse_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING;
    `, [booking.traveler_id, booking.traveler_id + '@example.com', 'dummy', 'nurse', booking.traveler_name, true]);

    const result = await db.query(`
      INSERT INTO bookings (id, listing_id, traveler_id, start_date, end_date, stay_duration_weeks, status, total_rent, base_monthly_rent, gross_booking_value, host_platform_fee_amount, host_payout_amount, cancellation_policy_agreed, host_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `, [booking.id, booking.listing_id, booking.traveler_id, booking.start_date, booking.end_date, booking.duration_weeks, booking.status, booking.total_traveler_charged, booking.monthly_rent, booking.total_traveler_charged, booking.platform_fee_amount, booking.host_net_payout, 'flexible', booking.host_id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to post audit logs
app.post('/api/audit-logs', async (req, res) => {
  try {
    const log = req.body;
    const result = await db.query(`
      INSERT INTO audit_logs (id, event_type, record_id, details, actor)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [log.id, log.event_type, log.record_id, log.details, log.actor]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch audit logs
app.get('/api/audit-logs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
