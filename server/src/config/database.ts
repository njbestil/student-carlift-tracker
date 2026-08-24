import pg from 'pg';
import { environment } from './environment.js';

export const pool = new pg.Pool({
  host: environment.POSTGRES_HOST,
  port: environment.POSTGRES_PORT,
  database: environment.POSTGRES_DB,
  user: environment.POSTGRES_USER,
  password: environment.POSTGRES_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const checkDatabaseHealth = async () => {
  const result = await pool.query<{ now: Date }>('SELECT now()');
  return result.rows[0];
};
