import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('connect', () => console.log('Connected to PostgreSQL! 🐘'));
pool.on('error', (err) => console.error('DB Client Error', err));

export default {
  query: (text, params) => pool.query(text, params),
};