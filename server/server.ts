import express from 'express';
import { db } from './db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './authRoutes.js';
import { authenticateToken, AuthenticatedRequest } from './authMiddleware.js';
import { mapDbListingToFrontend } from './mapper.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// Configure Helmet for security headers and Content-Security-Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval often needed for Vite/React dev
        scriptSrcElem: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "https://maps.googleapis.com", "https://nurses-pillow-dev-production.up.railway.app", "https://images.unsplash.com"],
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



// Endpoint to upload clinical credentials
app.post('/api/verify/license', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    // In a real application, you'd handle multipart/form-data with a library like multer
    // and upload the PDF to AWS S3. For this implementation, we will accept a JSON payload
    // and store the information in the database.
    const { licenseNumber, stateBoard, specialty, documentName } = req.body;

    if (!licenseNumber || !stateBoard) {
        return res.status(400).json({ error: 'License number and state board are required' });
    }

    // We update the user record to indicate verification is pending
    await db.query(`
      UPDATE users
      SET
        clinical_license_number = $1,
        clinical_state_board = $2,
        profession_specialty = $3,
        clinical_document_url = $4,
        is_nurse_verified = false,
        verification_status = 'pending_review'
      WHERE id = $5
    `, [licenseNumber, stateBoard, specialty, documentName || 'uploaded_document.pdf', userId]);

    res.json({ success: true, message: 'Credentials submitted for admin review.' });
  } catch (error) {
    console.error('Error submitting clinical credentials:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nurses Pillow API is running' });
});



// Admin endpoint to list pending verifications
app.get('/api/admin/verifications', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    const result = await db.query(`
      SELECT id, email, full_name, clinical_license_number, clinical_state_board, profession_specialty, clinical_document_url, verification_status
      FROM users
      WHERE verification_status = 'pending_review'
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin endpoint to approve verification and trigger data purge (NV-04, NV-06)
app.post('/api/admin/verifications/:userId/approve', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    const { userId } = req.params;

    // In a real application, you would make an API call to delete the document from S3 here.
    // We simulate the data purge by clearing the document URL and license number from the DB.

    await db.query(`
      UPDATE users
      SET
        is_nurse_verified = true,
        verification_status = 'verified',
        document_purged = true,
        document_purged_at = NOW(),
        clinical_document_url = NULL,
        clinical_license_number = NULL -- Purge raw license number for privacy
      WHERE id = $1
    `, [userId]);

    res.json({ success: true, message: 'Verification approved and sensitive data purged.' });
  } catch (error) {
    console.error('Error approving verification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
app.post('/api/bookings', authenticateToken, async (req: any, res) => {
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
app.post('/api/audit-logs', authenticateToken, async (req: any, res) => {
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
app.get('/api/audit-logs', authenticateToken, async (req: any, res) => {
  try {
    const result = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-02-24.acacia' as any,
});

// Stripe Connect Onboarding Link


// Endpoint to create a Stripe Identity Verification Session
app.post('/api/stripe/identity/session', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userRes = await db.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);

    // Create VerificationSession
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId: userId
      },
      options: {
        document: {
          require_matching_selfie: true
        }
      }
    });

    res.json({
      client_secret: verificationSession.client_secret,
      session_id: verificationSession.id
    });
  } catch (error) {
    console.error('Error creating Stripe Identity Session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/stripe/account-link', async (req, res) => {
  try {
    const { hostId, returnUrl, refreshUrl } = req.body;
    if (!hostId) {
      return res.status(400).json({ error: 'Missing hostId' });
    }

    // Get or create Stripe Connect Account
    let accountId;
    const userRes = await db.query('SELECT stripe_connected_account_id FROM users WHERE id = $1', [hostId]);

    if (userRes.rows.length > 0 && userRes.rows[0].stripe_connected_account_id) {
      accountId = userRes.rows[0].stripe_connected_account_id;
    } else {
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;
      await db.query('UPDATE users SET stripe_connected_account_id = $1 WHERE id = $2', [accountId, hostId]);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${process.env.APP_URL}/host/stripe/refresh`,
      return_url: returnUrl || `${process.env.APP_URL}/host/stripe/return`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error generating Stripe Account Link:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch payout status
app.get('/api/stripe/status/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;
    const userRes = await db.query('SELECT stripe_payouts_enabled FROM users WHERE id = $1', [hostId]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Host not found' });
    }

    res.json({ payouts_enabled: userRes.rows[0].stripe_payouts_enabled });
  } catch (error) {
    console.error('Error fetching Stripe status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to process a split payment via Stripe
app.post('/api/stripe/payment-intent', async (req, res) => {
  try {
    const { monthlyRent, cleaningFee, securityDeposit, hostConnectedAccountId, platformFeePercent } = req.body;

    // Minimal validation
    if (!hostConnectedAccountId) {
      return res.status(400).json({ error: 'Missing host connected account ID' });
    }

    const grossCharge = monthlyRent + cleaningFee;
    const platformFee = Math.round(grossCharge * platformFeePercent * 100); // Stripe uses cents
    const totalAmount = Math.round(grossCharge * 100); // Stripe uses cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: hostConnectedAccountId,
      },
      payment_method_types: ['card'],
      capture_method: 'manual', // Requires host to capture or decline
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error: any) {
    console.error('Error creating Stripe Payment Intent:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.post('/api/stripe/payment-intent/:id/capture', async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripe.paymentIntents.capture(id);
    res.json({ success: true, paymentIntent });
  } catch (error: any) {
    console.error('Error capturing Payment Intent:', error);
    res.status(500).json({ error: error.message || 'Failed to capture payment intent' });
  }
});

app.post('/api/stripe/payment-intent/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripe.paymentIntents.cancel(id);
    res.json({ success: true, paymentIntent });
  } catch (error: any) {
    console.error('Error canceling Payment Intent:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel payment intent' });
  }
});

// Stripe Webhook Route
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (endpointSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err: any) {
      console.warn(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  } else {
    // Fallback if no secret provided, trust the payload
    event = req.body;
  }

  try {
    switch (event.type) {
      case 'identity.verification_session.verified': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        if (userId) {
          console.log(`[Stripe Webhook] Identity verified for user: ${userId}`);
          await db.query('UPDATE users SET identity_verified = true WHERE id = $1', [userId]);
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object;
        if (account.payouts_enabled) {
          console.log(`[Stripe Webhook] Payouts enabled for account: ${account.id}`);
          await db.query(`
            UPDATE users SET stripe_payouts_enabled = true WHERE stripe_connected_account_id = $1
          `, [account.id]);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.send();
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).send('Webhook handler error');
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

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.join(__dirname, '../dist');

  app.use(express.static(distPath));

  // Explicitly fail for missing static assets (like old Vite chunks) to prevent serving HTML
  // with a 200 OK which causes MIME type errors and unhandled React Suspense failures
  app.get('/assets/*', (req, res) => {
    res.status(404).send('Asset not found');
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Avoid port collision during local dev (Vite uses 3000, Express uses 3001)
// In production (Railway), use process.env.PORT
const PORT = process.env.NODE_ENV === 'production' ? process.env.PORT || 3000 : 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
