import os

DB_PATH = os.getenv("DB_PATH", "data/games.db")

STEAM_APPDETAILS_URL = "https://store.steampowered.com/api/appdetails"
STEAM_APPREVIEWS_URL = "https://store.steampowered.com/appreviews/{app_id}"
STEAMSPY_URL = "https://steamspy.com/api.php"

STEAMSPY_TAG = "Co-op"
STEAMSPY_TAG_PAGES = 3  # SteamSpy는 페이지당 최대 1000개, owners 내림차순 반환
REQUIRED_GENRE = "Indie"

REQUEST_DELAY_SECONDS = 1.5
