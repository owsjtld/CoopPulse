import json

from config import REQUIRED_GENRE
from db import init_db, upsert_game
from steam_client import fetch_appdetails
from steamspy_client import fetch_tag_candidate_app_ids


def is_indie(details):
    genres = [g.get("description", "") for g in details.get("genres", [])]
    return REQUIRED_GENRE in genres


def main():
    init_db()
    candidates = fetch_tag_candidate_app_ids()
    print(f"[discover] Co-op 태그 후보 {len(candidates)}개 발견")

    added = 0
    for app_id in candidates:
        details = fetch_appdetails(app_id)
        if not details or details.get("type") != "game":
            continue
        if not is_indie(details):
            continue

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
        added += 1

    print(f"[discover] 인디+코옵 조건 통과 {added}개 게임 등록/갱신 완료")


if __name__ == "__main__":
    main()
