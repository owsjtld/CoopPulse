import os

DB_PATH = os.getenv("DB_PATH", "data/games.db")

STEAM_APPDETAILS_URL = "https://store.steampowered.com/api/appdetails"
STEAM_APPREVIEWS_URL = "https://store.steampowered.com/appreviews/{app_id}"
STEAMSPY_URL = "https://steamspy.com/api.php"

STEAMSPY_TAG = "Co-op"
# SteamSpy의 Co-op 태그 응답은 페이지네이션 없이 전체(수천 개)를 한 번에 반환한다.
# 리뷰가 거의 없는 게임은 트렌드 신호로 의미가 없으므로, 리뷰수 기준 상위 N개만 추린다.
MAX_CANDIDATES = 1000
REQUIRED_GENRE = "Indie"

REQUEST_DELAY_SECONDS = 1.5
