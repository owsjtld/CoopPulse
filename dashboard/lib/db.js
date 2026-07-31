import Database from "better-sqlite3";
import path from "path";

let gamesDbInstance = null;
let appDbInstance = null;

// 크롤러가 쓰는 원본 DB — 읽기 전용으로만 연다 (크롤러 쓰기와 경합 방지)
export function gamesDb() {
  if (!gamesDbInstance) {
    gamesDbInstance = new Database(
      path.join(process.cwd(), "..", "data", "games.db"),
      { readonly: true, fileMustExist: true }
    );
  }
  return gamesDbInstance;
}

// 대시보드 자체 데이터(유저/워치리스트/알림) — Supabase 전환 전까지의 로컬 스토어
export function appDb() {
  if (!appDbInstance) {
    appDbInstance = new Database(path.join(process.cwd(), "dev.db"));
    appDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        plan TEXT NOT NULL DEFAULT 'free',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        app_id INTEGER NOT NULL,
        added_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, app_id)
      );
      CREATE TABLE IF NOT EXISTS alert_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        rule_type TEXT NOT NULL,
        params TEXT NOT NULL,
        channel TEXT NOT NULL DEFAULT 'email',
        last_triggered_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS tracked_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        app_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requested_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }
  return appDbInstance;
}

export function getOrCreateUser(email) {
  const db = appDb();
  db.prepare("INSERT OR IGNORE INTO users (email) VALUES (?)").run(email);
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}
