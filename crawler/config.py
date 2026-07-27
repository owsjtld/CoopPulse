import os

DB_PATH = os.getenv("DB_PATH", "data/games.db")

STEAM_APPDETAILS_URL = "https://store.steampowered.com/api/appdetails"
STEAM_APPREVIEWS_URL = "https://store.steampowered.com/appreviews/{app_id}"
STEAMSPY_URL = "https://steamspy.com/api.php"

STEAMSPY_TAG = "Co-op"
# SteamSpy의 Co-op 태그 응답은 페이지네이션 없이 전체(수천 개)를 한 번에 반환한다.
MAX_CANDIDATES = 10000  # 실질적으로 전체 커버 (SteamSpy Co-op 태그 총량 약 6,250개)
REQUIRED_GENRE = "Indie"

REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "1.0"))

# discover_games가 appdetails를 동시에 몇 개까지 병렬로 조회할지. 5로 시도했더니 Steam이
# 거의 즉시 429(Too Many Requests)로 막아서 1(순차)로 되돌림.
DISCOVER_WORKERS = int(os.getenv("DISCOVER_WORKERS", "1"))

# ISO 8601 (예: "2026-07-25T17:55:00+09:00"). 설정되면 discover_games가 이 시각 이후
# 새 후보 처리를 시작하지 않고 진행 중이던 건만 마치고 중단한다.
DEADLINE = os.getenv("DISCOVER_DEADLINE")

# top5 랭킹을 "메가 히트"(이미 자리잡은 대형 타이틀) / "신흥 주목작"(중소/신생) 두 그룹으로
# 나누는 누적 리뷰수 기준. 절대 증가량만으로 순위를 매기면 대형 타이틀이 top5를 독식해서
# 신흥작이 묻히기 때문에 그룹을 분리한다. (실측: 07-25 스냅샷 기준 1,000개 이상이 상위 26%)
MEGA_HIT_THRESHOLD = 1000
# 신흥 그룹 최소 누적 리뷰수 — 이보다 적으면 리뷰 1~2개 증가도 과장된 순위로 잡히는 노이즈.
EMERGING_MIN_REVIEWS = 10
# 평점(positive_pct) 급변동 랭킹에 포함되려면 윈도우 내 신규 리뷰가 이 이상이어야 함
# (그렇지 않으면 리뷰 3개짜리가 우연히 100% 찍고 "역주행 1위"로 잡히는 왜곡이 생김).
RATING_MOVER_MIN_NEW_REVIEWS = 20
