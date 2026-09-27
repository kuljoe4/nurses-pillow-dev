import { db } from './db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { NC_HOSPITAL_SEEDS, NC_LISTING_SEEDS } from '../src/services/database.js';

dotenv.config();

async function seed() {
  console.log('Seeding Database with Enterprise Schema...');

  try {
    // Provision super_admin securely using environment variables
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      console.log('Provisioning super_admin account based on environment variables...');
      const saltRounds = 10;
      const adminHash = await bcrypt.hash(adminPassword, saltRounds);
      await db.query(`
        INSERT INTO users (id, email, password_hash, full_name, role, is_nurse_verified, is_host_verified)
        VALUES ('admin-root', $1, $2, 'Operations Administrator', 'super_admin', true, true)
        ON CONFLICT (id) DO UPDATE SET password_hash = $2, email = $1, role = 'super_admin', full_name = 'Operations Administrator'
      `, [adminEmail.toLowerCase(), adminHash]);
      console.log('Super admin provisioned successfully.');
    }

    for (const h of NC_HOSPITAL_SEEDS) {
        await db.query(`
          INSERT INTO healthcare_facilities (id, name, health_system, address_line1, city, state, postal_code, latitude, longitude, trauma_level, teaching_hospital, parking_type, nurse_feedback_score)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING;
        `, [h.id, h.name, h.health_system, h.address, h.city, h.state, h.zip, h.latitude, h.longitude, h.trauma_level, h.teaching_hospital, h.parking_type, h.nurse_feedback_score]);
    }

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, full_name, is_host_verified)
      VALUES
      ('host-sarah-m', 'host-sarah@example.com', 'dummy_hash', 'host', 'Sarah M', true),
      ('host-karen-b', 'host-karen@example.com', 'dummy_hash', 'host', 'Karen B', true),
      ('host-james-l', 'host-james@example.com', 'dummy_hash', 'host', 'James L', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    for (const l of NC_LISTING_SEEDS) {
      await db.query(`
        INSERT INTO listings (id, host_id, title, description, address_line1, city, state, postal_code, latitude, longitude, nearest_hospital_id, monthly_rent, security_deposit_amount, cleaning_fee, is_published, is_verified_by_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING;
      `, [l.id, l.host_id, l.title, 'A beautiful sanctuary for clinicians.', l.address, l.city, l.state, l.zip, l.latitude, l.longitude, l.nearest_hospital_id, l.monthly_rate, l.security_deposit, l.cleaning_fee, l.is_active, true]);
    }

    console.log('Seeding Complete');
  } catch(e) {
    console.error('Error seeding data', e);
  } finally {
      process.exit();
  }
}
seed();
