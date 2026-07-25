import os
import sqlite3
from datetime import datetime, timezone

from config import DB_PATH


def get_conn():
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS games (
            app_id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            developer TEXT,
            release_date TEXT,
            price_krw INTEGER,
            genres TEXT,
            categories TEXT,
            first_tracked_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS review_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id INTEGER NOT NULL REFERENCES games(app_id),
            snapshot_date TEXT NOT NULL,
            review_count INTEGER NOT NULL,
            positive_pct REAL,
            UNIQUE(app_id, snapshot_date)
        );
        """
    )
    conn.commit()
    conn.close()


def upsert_game(app_id, name, developer, release_date, price_krw, genres, categories):
    conn = get_conn()
    conn.execute(
        """
        INSERT INTO games (app_id, name, developer, release_date, price_krw, genres, categories, first_tracked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(app_id) DO UPDATE SET
            name=excluded.name,
            developer=excluded.developer,
            release_date=excluded.release_date,
            price_krw=excluded.price_krw,
            genres=excluded.genres,
            categories=excluded.categories
        """,
        (
            app_id,
            name,
            developer,
            release_date,
            price_krw,
            genres,
            categories,
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def insert_snapshot(app_id, snapshot_date, review_count, positive_pct):
    conn = get_conn()
    conn.execute(
        """
        INSERT INTO review_snapshots (app_id, snapshot_date, review_count, positive_pct)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(app_id, snapshot_date) DO UPDATE SET
            review_count=excluded.review_count,
            positive_pct=excluded.positive_pct
        """,
        (app_id, snapshot_date, review_count, positive_pct),
    )
    conn.commit()
    conn.close()


def get_all_tracked_app_ids():
    conn = get_conn()
    rows = conn.execute("SELECT app_id FROM games").fetchall()
    conn.close()
    return [r[0] for r in rows]
