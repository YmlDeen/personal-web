import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, '../../../data/app.db');

let db;

export async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    db = new SQL.Database();
  }
  saveDb();
  await runMigrations();
  return db;
}

export function saveDb() {
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

async function runMigrations() {
  db.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);
  saveDb();
  const { migrations } = await import('./migrations.js');
  for (const { version, up } of migrations) {
    const applied = db.exec(
      `SELECT version FROM schema_migrations WHERE version = '${version}'`
    );
    if (applied.length > 0 && applied[0].values.length > 0) continue;
    console.log('[migrate] applying ' + version);
    db.run(up);
    db.run(`INSERT INTO schema_migrations (version) VALUES ('${version}')`);
    saveDb();
    console.log('[migrate] ' + version + ' done');
  }
}

export { saveDb as save };
