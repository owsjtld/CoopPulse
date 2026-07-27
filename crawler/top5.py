from collections import defaultdict
from datetime import datetime, timedelta, timezone

from config import EMERGING_MIN_REVIEWS, MEGA_HIT_THRESHOLD, RATING_MOVER_MIN_NEW_REVIEWS
from db import get_conn


def _load_window_deltas(days=7):
    since = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()

    conn = get_conn()
    rows = conn.execute(
        """
        SELECT app_id, snapshot_date, review_count, positive_pct
        FROM review_snapshots
        WHERE snapshot_date >= ?
        ORDER BY app_id, snapshot_date
        """,
        (since,),
    ).fetchall()

    by_app = defaultdict(list)
    for app_id, date, count, positive_pct in rows:
        by_app[app_id].append((date, count, positive_pct))

    deltas = []
    for app_id, points in by_app.items():
        if len(points) < 2:
            continue
        _, oldest_count, oldest_pct = points[0]
        _, latest_count, latest_pct = points[-1]
        name_row = conn.execute("SELECT name FROM games WHERE app_id=?", (app_id,)).fetchone()
        positive_pct_change = (
            round(latest_pct - oldest_pct, 2)
            if oldest_pct is not None and latest_pct is not None
            else None
        )
        deltas.append(
            {
                "app_id": app_id,
                "name": name_row[0] if name_row else None,
                "oldest_count": oldest_count,
                "latest_count": latest_count,
                "review_growth": latest_count - oldest_count,
                "oldest_positive_pct": oldest_pct,
                "latest_positive_pct": latest_pct,
                "positive_pct_change": positive_pct_change,
            }
        )
    conn.close()
    return deltas


def top5_mega_hits(days=7, limit=5):
    """누적 리뷰 MEGA_HIT_THRESHOLD 이상(윈도우 시작 시점 기준)인 대형 타이틀 중 리뷰 증가량 top N."""
    deltas = [d for d in _load_window_deltas(days) if d["oldest_count"] >= MEGA_HIT_THRESHOLD]
    deltas.sort(key=lambda d: d["review_growth"], reverse=True)
    return deltas[:limit]


def top5_emerging(days=7, limit=5):
    """EMERGING_MIN_REVIEWS ~ MEGA_HIT_THRESHOLD 사이(윈도우 시작 시점 기준) 신흥작 중 리뷰 증가량 top N."""
    deltas = [
        d
        for d in _load_window_deltas(days)
        if EMERGING_MIN_REVIEWS <= d["oldest_count"] < MEGA_HIT_THRESHOLD
    ]
    deltas.sort(key=lambda d: d["review_growth"], reverse=True)
    return deltas[:limit]


def top5_rating_movers(days=7, limit=5, min_new_reviews=RATING_MOVER_MIN_NEW_REVIEWS):
    """윈도우 내 신규 리뷰가 min_new_reviews 이상인 게임 중 평점(%p) 변동폭(절대값) top N — 급상승/급하락 모두 포함."""
    deltas = [
        d
        for d in _load_window_deltas(days)
        if d["positive_pct_change"] is not None and d["review_growth"] >= min_new_reviews
    ]
    deltas.sort(key=lambda d: abs(d["positive_pct_change"]), reverse=True)
    return deltas[:limit]


if __name__ == "__main__":
    print(f"=== 메가 히트 (누적리뷰 {MEGA_HIT_THRESHOLD}개+) 리뷰 증가 top5 ===")
    for entry in top5_mega_hits():
        print(entry)

    print(f"\n=== 신흥 주목작 (누적리뷰 {EMERGING_MIN_REVIEWS}~{MEGA_HIT_THRESHOLD}개) 리뷰 증가 top5 ===")
    for entry in top5_emerging():
        print(entry)

    print("\n=== 평점 급변동 top5 (역주행/급락 포함) ===")
    for entry in top5_rating_movers():
        print(entry)
