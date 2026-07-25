from datetime import datetime, timezone

from db import get_all_tracked_app_ids, init_db, insert_snapshot
from steam_client import fetch_review_summary


def main():
    init_db()
    app_ids = get_all_tracked_app_ids()
    today = datetime.now(timezone.utc).date().isoformat()

    saved = 0
    for app_id in app_ids:
        summary = fetch_review_summary(app_id)
        if not summary:
            continue
        total = summary.get("total_reviews", 0)
        positive = summary.get("total_positive", 0)
        positive_pct = round(positive / total * 100, 2) if total else None
        insert_snapshot(app_id, today, total, positive_pct)
        saved += 1

    print(f"[snapshot] {today} 기준 {saved}/{len(app_ids)}개 게임 리뷰 스냅샷 저장 완료")


if __name__ == "__main__":
    main()
