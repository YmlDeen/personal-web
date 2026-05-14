export const migrations = [
  {
    version: '001_initial_schema',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        username   TEXT UNIQUE NOT NULL,
        password   TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS notes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        title      TEXT NOT NULL,
        content    TEXT,
        tags       TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        title      TEXT NOT NULL,
        status     TEXT DEFAULT 'todo',
        priority   TEXT DEFAULT 'medium',
        due_date   TEXT,
        repeat     TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS links (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        title      TEXT NOT NULL,
        url        TEXT NOT NULL,
        tags       TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS logs (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        action     TEXT NOT NULL,
        detail     TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        token      TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS habits (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        name       TEXT NOT NULL,
        color      TEXT DEFAULT '#00ff88',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS habit_logs (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        user_id  INTEGER NOT NULL,
        date     TEXT NOT NULL,
        UNIQUE(habit_id, date)
      );
      CREATE TABLE IF NOT EXISTS finance (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        type       TEXT NOT NULL,
        amount     REAL NOT NULL,
        category   TEXT,
        note       TEXT,
        date       TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `
  },
  {
    version: '002_relationships',
    up: `
      CREATE TABLE IF NOT EXISTS relationships (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        source_type TEXT NOT NULL,
        source_id   INTEGER NOT NULL,
        target_type TEXT NOT NULL,
        target_id   INTEGER NOT NULL,
        created_at  TEXT DEFAULT (datetime('now')),
        UNIQUE(source_type, source_id, target_type, target_id)
      );
    `
  },

  {
    version: '003_links_upgrade',
    up: `
      ALTER TABLE links ADD COLUMN description TEXT DEFAULT '';
      ALTER TABLE links ADD COLUMN category    TEXT DEFAULT 'Other';
      ALTER TABLE links ADD COLUMN favicon     TEXT DEFAULT '';
      ALTER TABLE links ADD COLUMN image       TEXT DEFAULT '';
      ALTER TABLE links ADD COLUMN favorite    INTEGER DEFAULT 0;
    `
  }

];
