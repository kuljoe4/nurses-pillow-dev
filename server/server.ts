import express from 'express';
import { db } from './db.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nurses Pillow API is running' });
});

// Endpoint to fetch hospitals
app.get('/api/hospitals', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM hospitals');
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
      SELECT l.*,
        (SELECT json_agg(r.*) FROM rooms r WHERE r.listing_id = l.id) as rooms,
        (SELECT json_agg(p.*) FROM pricing_calendar p WHERE p.listing_id = l.id) as pricing_calendar
      FROM listings l
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
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

// Endpoint to create bookings
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = req.body;

    // Check traveler user exists or create
    await db.query(`
      INSERT INTO users (id, email, role, legal_name, verification_status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING;
    `, [booking.traveler_id, booking.traveler_id + '@example.com', 'nurse', booking.traveler_name, 'verified']);

    const result = await db.query(`
      INSERT INTO bookings (id, listing_id, traveler_id, start_date, end_date, status, total_traveler_charged, host_net_payout, platform_fee_amount, security_deposit_hold)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [booking.id, booking.listing_id, booking.traveler_id, booking.start_date, booking.end_date, booking.status, booking.total_traveler_charged, booking.host_net_payout, booking.platform_fee_amount, booking.security_deposit_hold]);

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
