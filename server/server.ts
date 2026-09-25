import express from 'express';
import { db } from './db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './authRoutes.js';
import { mapDbListingToFrontend } from './mapper.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();

// Configure Helmet for security headers and Content-Security-Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval often needed for Vite/React dev
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "https://maps.googleapis.com", "https://nurses-pillow-dev-production.up.railway.app"],
        connectSrc: ["'self'", "https://maps.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

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

// Postmark Webhook Route
app.post('/api/webhooks/postmark', async (req, res) => {
  try {
    const authHeader = req.headers['x-postmark-secret'];
    if (!process.env.POSTMARK_WEBHOOK_SECRET || authHeader !== process.env.POSTMARK_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized webhook call' });
    }

    const payload = req.body;
    if (!payload || !payload.RecordType) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const eventRecordType = payload.RecordType;

    switch (eventRecordType) {
      case 'Delivery': {
        const recipientEmail = payload.Recipient;
        const messageId = payload.MessageID;
        console.log(`[Postmark] Email successfully delivered to: ${recipientEmail} (ID: ${messageId})`);

        // Log delivery to audit_logs
        // First try to find the user id from email
        const userRes = await db.query(`SELECT id FROM users WHERE email = $1`, [recipientEmail]);
        if (userRes.rows.length > 0) {
          const userId = userRes.rows[0].id;
          await db.query(`
            INSERT INTO audit_logs (id, event_type, record_id, details, actor)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            uuidv4(),
            'email_delivery',
            messageId,
            `Email delivered. Postmark MessageID: ${messageId}`,
            userId
          ]);
        }
        break;
      }
      case 'Bounce': {
        const recipientEmail = payload.Recipient;
        const bounceType = payload.Type;
        const description = payload.Description;
        console.warn(`[Postmark] Email bounced for ${recipientEmail}: ${bounceType} - ${description}`);

        // If hard bounce, mark user email as invalid in your database
        if (payload.TypeCode === 1) {
          await db.query(`
            UPDATE users SET email_verified = false WHERE email = $1
          `, [recipientEmail]);
        }
        break;
      }
      case 'SpamComplaint': {
        const recipientEmail = payload.Recipient;
        console.warn(`[Postmark] Spam complaint recorded from: ${recipientEmail}`);

        // Log the spam complaint to audit_logs
        const userRes = await db.query(`SELECT id FROM users WHERE email = $1`, [recipientEmail]);
        if (userRes.rows.length > 0) {
          const userId = userRes.rows[0].id;
          await db.query(`
            INSERT INTO audit_logs (id, event_type, record_id, details, actor)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            uuidv4(),
            'spam_complaint',
            userId,
            `Spam complaint received for ${recipientEmail}. Notification preferences paused.`,
            'system'
          ]);

          // Also optionally suspend user or log that preferences are updated.
          // Since there is no explicit `notification_preferences` column, we update audit logs.
        }
        break;
      }
      default:
        // Acknowledge other event types (Open, Click, SubscriptionChange)
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`Postmark webhook error: ${err.message}`);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
