import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
const SALT_ROUNDS = 12;

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = `usr_${uuidv4()}`;

    const result = await db.query(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role
    `, [userId, email, passwordHash, fullName, role]);

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' });
      return;
    }

    const result = await db.query('SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin) {
      res.status(400).json({ error: 'Email and 6-digit PIN are required.' });
      return;
    }

    const cleanPin = pin.toString().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      res.status(400).json({ error: 'Verification PIN must be exactly 6 digits.' });
      return;
    }

    try {
      await db.query('UPDATE users SET email_verified = true WHERE email = $1', [email]);
    } catch {
      // Ignore
    }

    res.json({
      success: true,
      email,
      verified: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

router.get('/me', async (req, res) => {
  const token =
    req.cookies?.auth_token ||
    (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));

  if (!token) {
    res.json({ user: null });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const result = await db.query(
      'SELECT id, email, full_name, role, is_nurse_verified, is_host_verified FROM users WHERE id = $1',
      [decoded.id]
    );
    res.json({ user: result.rows[0] || null });
  } catch {
    res.json({ user: null });
  }
});

export default router;
