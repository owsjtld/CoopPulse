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

# 3. 최근 7일 리뷰 증가량 Top 5 확인
python crawler/top5.py
```

데이터는 `data/games.db` (SQLite)에 저장되고 repo에 커밋됩니다. API 키는 필요 없습니다 —
Steam appdetails/appreviews, SteamSpy 모두 공개 엔드포인트만 사용합니다.

GitHub Actions가 매일 자동으로 `daily_snapshot.py`를 돌리고 결과를 커밋합니다
(`.github/workflows/daily-crawl.yml`). 단, 이 워크플로우는 default 브랜치(main)에
있어야 스케줄이 동작하므로, 검증 후 main에 머지되기 전까지는 로컬/수동 실행으로 확인합니다.
