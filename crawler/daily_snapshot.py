from datetime import datetime, timezone

from db import get_all_tracked_app_ids, init_db, insert_snapshot
from steam_client import fetch_review_summary


def main():
    init_db()
    app_ids = get_all_tracked_app_ids()
    today = datetime.now(timezone.utc).date().isoformat()

    saved = 0
    for i, app_id in enumerate(app_ids, start=1):
        summary = fetch_review_summary(app_id)
        if summary:
            total = summary.get("total_reviews", 0)
            positive = summary.get("total_positive", 0)
            positive_pct = round(positive / total * 100, 2) if total else None
            insert_snapshot(app_id, today, total, positive_pct)
            saved += 1
        if i % 25 == 0:
            print(f"[snapshot] 진행 {i}/{len(app_ids)}", flush=True)

    print(f"[snapshot] {today} 기준 {saved}/{len(app_ids)}개 게임 리뷰 스냅샷 저장 완료")


if __name__ == "__main__":
    main()
