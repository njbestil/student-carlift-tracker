import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.resolve(__dirname, '../migrations');

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const files = (await fs.readdir(migrationsDirectory))
      .filter((file) => file.endsWith('.sql'))
      .sort((left, right) => left.localeCompare(right));

    const appliedResult = await client.query<{ filename: string }>('SELECT filename FROM schema_migrations');
    const appliedFiles = new Set(appliedResult.rows.map((row) => row.filename));

    for (const file of files) {
      if (appliedFiles.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      const migrationSql = await fs.readFile(path.join(migrationsDirectory, file), 'utf8');

      console.log(`Applying migration: ${file}`);
      await client.query('BEGIN');
      await client.query(migrationSql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations().catch((error) => {
  console.error(error);
  process.exit(1);
});
