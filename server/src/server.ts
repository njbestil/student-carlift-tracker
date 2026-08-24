import { createServer } from 'node:http';
import { pool } from './config/database.js';
import { environment } from './config/environment.js';
import { createApp } from './app.js';

const app = createApp();
const server = createServer(app);

server.listen(environment.PORT, () => {
  console.log(`API server listening on http://localhost:${environment.PORT}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`${signal} received. Shutting down API server.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
