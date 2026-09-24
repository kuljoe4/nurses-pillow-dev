import { db } from './db.js';
import dotenv from 'dotenv';
import { NC_HOSPITAL_SEEDS, NC_LISTING_SEEDS } from '../src/services/database.js';

dotenv.config();

async function seed() {
  console.log('Seeding Database...');

  try {
    for (const h of NC_HOSPITAL_SEEDS) {
        await db.query(`
          INSERT INTO hospitals (id, name, health_system, address, city, state, zip, latitude, longitude, trauma_level, teaching_hospital, parking_type, nurse_feedback_score)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING;
        `, [h.id, h.name, h.health_system, h.address, h.city, h.state, h.zip, h.latitude, h.longitude, h.trauma_level, h.teaching_hospital, h.parking_type, h.nurse_feedback_score]);
    }

    // We would need a user for host_id if listings require it. For simplicity, we could create a dummy user.
    await db.query(`
      INSERT INTO users (id, email, role, legal_name, verification_status)
      VALUES
      ('host-sarah-m', 'host-sarah@example.com', 'host', 'Sarah M', 'verified'),
      ('host-karen-b', 'host-karen@example.com', 'host', 'Karen B', 'verified'),
      ('host-james-l', 'host-james@example.com', 'host', 'James L', 'verified')
      ON CONFLICT (id) DO NOTHING;
    `);

    for (const l of NC_LISTING_SEEDS) {
      await db.query(`
        INSERT INTO listings (id, host_id, title, property_type, cancellation_tier, address, city, state, zip, latitude, longitude, nearest_hospital_id, monthly_rate, security_deposit, cleaning_fee, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING;
      `, [l.id, l.host_id, l.title, l.property_type, l.cancellation_tier, l.address, l.city, l.state, l.zip, l.latitude, l.longitude, l.nearest_hospital_id, l.monthly_rate, l.security_deposit, l.cleaning_fee, l.is_active]);
    }

    console.log('Seeding Complete');
  } catch(e) {
    console.error('Error seeding data', e);
  } finally {
      process.exit();
  }
}
seed();
