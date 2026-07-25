import os

DB_PATH = os.getenv("DB_PATH", "data/games.db")

STEAM_APPDETAILS_URL = "https://store.steampowered.com/api/appdetails"
STEAM_APPREVIEWS_URL = "https://store.steampowered.com/appreviews/{app_id}"
STEAMSPY_URL = "https://steamspy.com/api.php"

STEAMSPY_TAG = "Co-op"
# SteamSpy의 Co-op 태그 응답은 페이지네이션 없이 전체(수천 개)를 한 번에 반환한다.
MAX_CANDIDATES = 10000  # 실질적으로 전체 커버 (SteamSpy Co-op 태그 총량 약 6,250개)
REQUIRED_GENRE = "Indie"

REQUEST_DELAY_SECONDS = 1.5

# ISO 8601 (예: "2026-07-25T17:55:00+09:00"). 설정되면 discover_games가 이 시각 이후
# 새 후보 처리를 시작하지 않고 진행 중이던 건만 마치고 중단한다.
DEADLINE = os.getenv("DISCOVER_DEADLINE")
