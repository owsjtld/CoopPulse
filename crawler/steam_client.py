import time

import requests

from config import REQUEST_DELAY_SECONDS, STEAM_APPDETAILS_URL, STEAM_APPREVIEWS_URL


def fetch_appdetails(app_id):
    try:
        resp = requests.get(
            STEAM_APPDETAILS_URL,
            params={"appids": app_id, "cc": "kr", "l": "english"},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.exceptions.RequestException, ValueError) as e:
        print(f"[steam_client] appdetails 요청 실패 (app_id={app_id}): {e}", flush=True)
        time.sleep(REQUEST_DELAY_SECONDS)
        return None
    time.sleep(REQUEST_DELAY_SECONDS)

    entry = data.get(str(app_id))
    if not entry or not entry.get("success"):
        return None
    return entry.get("data")


def fetch_review_summary(app_id):
    url = STEAM_APPREVIEWS_URL.format(app_id=app_id)
    try:
        resp = requests.get(
            url,
            params={"json": 1, "language": "all", "purchase_type": "all", "num_per_page": 0},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.exceptions.RequestException, ValueError) as e:
        print(f"[steam_client] appreviews 요청 실패 (app_id={app_id}): {e}", flush=True)
        time.sleep(REQUEST_DELAY_SECONDS)
        return None
    time.sleep(REQUEST_DELAY_SECONDS)

    if data.get("success") != 1:
        return None
    return data.get("query_summary")
