import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from config import DEADLINE, DISCOVER_WORKERS, REQUIRED_GENRE
from db import get_all_tracked_app_ids, init_db, upsert_game
from steam_client import fetch_appdetails
from steamspy_client import fetch_tag_candidate_app_ids


def is_indie(details):
    genres = [g.get("description", "") for g in details.get("genres", [])]
    return REQUIRED_GENRE in genres


def process_candidate(app_id):
    details = fetch_appdetails(app_id)
    if details and details.get("type") == "game" and is_indie(details):
        price_overview = details.get("price_overview") or {}
        final_price = price_overview.get("final")
        upsert_game(
            app_id=app_id,
            name=details.get("name"),
            developer=", ".join(details.get("developers", [])),
            release_date=(details.get("release_date") or {}).get("date"),
            # Steam은 KRW도 다른 화폐처럼 100을 곱해서 반환한다 (525000 == ₩5,250)
            price_krw=final_price // 100 if final_price is not None else None,
            genres=json.dumps([g["description"] for g in details.get("genres", [])], ensure_ascii=False),
            categories=json.dumps([c["description"] for c in details.get("categories", [])], ensure_ascii=False),
        )
        return True
    return False


def main():
    init_db()
    candidates = fetch_tag_candidate_app_ids()
    already_tracked = set(get_all_tracked_app_ids())
    candidates = [a for a in candidates if a not in already_tracked]
    print(
        f"[discover] Co-op 태그 후보 {len(candidates)}개 "
        f"(이미 등록된 {len(already_tracked)}개는 스킵, 동시 {DISCOVER_WORKERS}개씩 처리)",
        flush=True,
    )

    deadline = datetime.fromisoformat(DEADLINE) if DEADLINE else None

    added = 0
    done = 0
    stopped_early = False
    with ThreadPoolExecutor(max_workers=DISCOVER_WORKERS) as pool:
        futures = {}
        for app_id in candidates:
            if deadline and datetime.now(deadline.tzinfo) >= deadline:
                stopped_early = True
                break
            futures[pool.submit(process_candidate, app_id)] = app_id

        for future in as_completed(futures):
            done += 1
            if future.result():
                added += 1
            if done % 25 == 0:
                print(f"[discover] 진행 {done}/{len(futures)} (등록 {added}개)", flush=True)

    if stopped_early:
        print(f"[discover] 데드라인 도달 - 남은 후보는 제출하지 않고 중단", flush=True)

    status = "(데드라인으로 중단)" if stopped_early else "(전체 완료)"
    print(f"[discover] 인디+코옵 조건 통과 {added}개 게임 등록/갱신 완료 {status}")


if __name__ == "__main__":
    main()
