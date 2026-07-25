import time

import requests

from config import REQUEST_DELAY_SECONDS, STEAMSPY_TAG, STEAMSPY_TAG_PAGES, STEAMSPY_URL


def fetch_tag_candidate_app_ids():
    app_ids = []
    for page in range(STEAMSPY_TAG_PAGES):
        resp = requests.get(
            STEAMSPY_URL,
            params={"request": "tag", "tag": STEAMSPY_TAG, "page": page},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        if not data:
            break
        app_ids.extend(int(app_id) for app_id in data.keys())
        time.sleep(REQUEST_DELAY_SECONDS)
    return app_ids
