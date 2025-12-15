import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');

declare global { var postgres: Pool | undefined; }

let pool: Pool;
if (process.env.NODE_ENV === 'production') {
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
} else {
  if (!global.postgres) global.postgres = new Pool({ connectionString: process.env.DATABASE_URL });
  pool = global.postgres;
}

export { pool };
