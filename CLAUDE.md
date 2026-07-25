# CLAUDE.md

이 파일은 Claude Code가 이 작업 디렉토리에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

**CoopPulse** — 코옵(협동) 인디게임 시장을 매일 추적하는 데이터 파이프라인.
저장소: https://github.com/owsjtld/CoopPulse
Steam 리뷰 증가량 기반으로 "이번 주 뜨는 코옵 인디게임"을 뽑아내고, 이 데이터로
인디게임 개발자 대상 뉴스레터와 유료 분석 대시보드를 만드는 것이 목표.

### 현재 상태
<!-- STATUS:START -->
2026-07-26 01:18 기준 추적 게임 4005개 (SteamSpy Co-op 태그 로컬 전량 스캔 진행 중 — 남은 후보는 다음 로컬/수동 실행에서 이어서 처리).
<!-- STATUS:END -->

### 단계별 계획
1. **크롤러** (현재 단계) — Steam/SteamSpy에서 코옵+인디 게임 리뷰 데이터를 매일 수집
2. **뉴스레터** — 수집 데이터를 Claude API로 요약해 개발자 대상 무료 뉴스레터 발송, 구독자 확보
3. **유료 대시보드** — 뉴스레터로 검증 후, Next.js + Supabase + 결제(포트원)로 구독형 SaaS 구축

## 기술 스택

- 크롤러: Python 3.12, `requests`, SQLite (`data/games.db`)
- 자동화: GitHub Actions (스케줄러) — 서버 비용 없이 무료 티어로 운영
- 데이터 소스: Steam `appdetails`/`appreviews` 공개 엔드포인트, SteamSpy API — **API 키 불필요**

## 명령어

```bash
python -m venv .venv && ".venv/Scripts/python.exe" -m pip install -r requirements.txt
python crawler/discover_games.py   # 추적 대상 게임 등록/갱신 (가끔)
python crawler/daily_snapshot.py   # 오늘자 리뷰 스냅샷 저장 (매일)
python crawler/top5.py             # 최근 7일 리뷰 증가량 Top 5
```

## Git 워크플로우 (중요)

- `main` 브랜치는 사용자가 직접 관리한다. **Claude Code는 main에 절대 push하지 않는다.**
- Claude Code는 항상 **오늘 날짜 브랜치**(예: `2026-07-25`)를 만들어 그 브랜치에만 커밋/push한다.
- main으로의 병합(PR)은 사용자가 직접 수행한다.
- GitHub Actions의 스케줄(cron) 트리거는 default 브랜치(main)에 워크플로우 파일이 있어야 동작하므로,
  워크플로우가 실제로 매일 자동 실행되려면 사용자가 PR을 머지한 이후부터다.

## 작업 규칙

- 새 프로젝트를 시작하기 전에는 목적과 범위를 먼저 확인한다.
- 커밋/푸시, 파일 삭제 등 되돌리기 어려운 작업은 사용자 확인을 받는다.
- 이 파일은 코드베이스 구조, 빌드/테스트 명령어, 컨벤션 등 "현재 상태를 보면 알 수 있는 정보"를 기록하는 용도로 사용한다. (히스토리성 맥락은 memory 시스템에 기록)
