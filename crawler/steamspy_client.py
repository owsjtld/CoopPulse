import time

import requests

from config import MAX_CANDIDATES, REQUEST_DELAY_SECONDS, STEAMSPY_TAG, STEAMSPY_URL


def fetch_tag_candidate_app_ids():
    resp = requests.get(
        STEAMSPY_URL,
        params={"request": "tag", "tag": STEAMSPY_TAG},
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    time.sleep(REQUEST_DELAY_SECONDS)

    # 리뷰수(positive+negative) 내림차순 정렬 후 상위 N개만 반환 — 트렌드 신호가 없는
    # 리뷰 0~1개짜리 게임까지 전부 확인하면 appdetails 호출이 수천 건으로 늘어난다.
    entries = sorted(
        data.values(),
        key=lambda v: v.get("positive", 0) + v.get("negative", 0),
        reverse=True,
    )
    return [int(entry["appid"]) for entry in entries[:MAX_CANDIDATES]]
