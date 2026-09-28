const fs = require('fs');
const file = 'server/server.ts';
let code = fs.readFileSync(file, 'utf8');

const stripeIdentityCode = `

// Endpoint to create a Stripe Identity Verification Session
app.post('/api/stripe/identity/session', authenticateToken, async (req, res) => {
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
`;

// Insert after Stripe initialization
code = code.replace(
  "app.post('/api/stripe/account-link', async (req, res) => {",
  stripeIdentityCode + "\napp.post('/api/stripe/account-link', async (req, res) => {"
);

const stripeWebhookPatch = `
      case 'identity.verification_session.verified': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        if (userId) {
          console.log(\`[Stripe Webhook] Identity verified for user: \${userId}\`);
          await db.query('UPDATE users SET identity_verified = true WHERE id = $1', [userId]);
        }
        break;
      }
`;

code = code.replace(
  "switch (event.type) {",
  "switch (event.type) {" + stripeWebhookPatch
);

// We need to import authenticateToken
if (!code.includes('authenticateToken')) {
    code = code.replace(
        "import authRoutes from './authRoutes.js';",
        "import authRoutes from './authRoutes.js';\nimport { authenticateToken } from './authMiddleware.js';"
    );
}

fs.writeFileSync(file, code);
console.log('Stripe identity backend patched.');
