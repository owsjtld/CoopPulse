# CoopPulse

코옵(협동) 인디게임 시장을 매일 추적하는 데이터 파이프라인. Steam 리뷰 증가량을 기준으로
"이번 주 뜨는 코옵 인디게임"을 뽑아내고, 이 데이터로 개발자 대상 뉴스레터(Phase 2)와
유료 대시보드(Phase 3)를 만드는 것이 목표.

## 로컬 실행

```bash
pip install -r requirements.txt

# 1. 추적 대상 게임 등록/갱신 (가끔만 실행)
python crawler/discover_games.py

# 2. 오늘자 리뷰 스냅샷 저장 (매일 실행)
python crawler/daily_snapshot.py

# 3. 최근 7일 리뷰 증가량 Top 5 확인 (메가 히트 / 신흥 주목작 / 평점 급변동 3분할)
python crawler/top5.py
```

데이터는 `data/games.db` (SQLite)에 저장되고 repo에 커밋됩니다. API 키는 필요 없습니다 —
Steam appdetails/appreviews, SteamSpy 모두 공개 엔드포인트만 사용합니다.

GitHub Actions가 매일 자동으로 `daily_snapshot.py`를 돌리고 결과를 커밋합니다
(`.github/workflows/daily-crawl.yml`, `main`에 병합되어 매일 KST 06:00에 실행 중).

## 현재 데이터 현황

<!-- STATUS:START -->
- 마지막 갱신: 2026-07-26 15:03
- 추적 중인 코옵+인디 게임: **4047개**
- 2026-07-26자 리뷰 스냅샷: 4005개
<!-- STATUS:END -->
