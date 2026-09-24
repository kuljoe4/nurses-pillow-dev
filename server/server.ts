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
