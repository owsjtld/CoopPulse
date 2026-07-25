from collections import defaultdict
from datetime import datetime, timedelta, timezone

from db import get_conn


def top5_review_growth(days=7, limit=5):
    since = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()

    conn = get_conn()
    rows = conn.execute(
        """
        SELECT app_id, snapshot_date, review_count
        FROM review_snapshots
        WHERE snapshot_date >= ?
        ORDER BY app_id, snapshot_date
        """,
        (since,),
    ).fetchall()

    by_app = defaultdict(list)
    for app_id, date, count in rows:
        by_app[app_id].append((date, count))

    growth = []
    for app_id, points in by_app.items():
        if len(points) < 2:
            continue
        oldest_count = points[0][1]
        latest_count = points[-1][1]
        growth.append((app_id, latest_count - oldest_count, latest_count))

    growth.sort(key=lambda x: x[1], reverse=True)

    result = []
    for app_id, delta, latest_count in growth[:limit]:
        name_row = conn.execute("SELECT name FROM games WHERE app_id=?", (app_id,)).fetchone()
        result.append(
            {
                "app_id": app_id,
                "name": name_row[0] if name_row else None,
                "review_growth": delta,
                "review_count": latest_count,
            }
        )
    conn.close()
    return result


if __name__ == "__main__":
    for entry in top5_review_growth():
        print(entry)
