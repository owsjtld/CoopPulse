# CoopPulse Dashboard (개발 스켈레톤)

유료 대시보드(Phase 3)의 로컬 뼈대. 실제 Supabase/Resend/포트원 계정이 없어도
동작하도록 로그인·데이터 저장을 전부 로컬로 대체해뒀다 — 계정이 생기면 아래
자리만 교체하면 됨.

## 지금 상태 (임시 구현)

- **로그인**: `lib/auth.js` — 이메일만 입력하면 쿠키로 세션 생성, 비밀번호/검증 없음. → Supabase Auth로 교체 예정.
- **유저/워치리스트/알림 저장**: `dashboard/dev.db` (SQLite, git에 커밋 안 됨). → Supabase Postgres로 교체 예정, 스키마는 `lib/db.js`의 `CREATE TABLE`이 그대로 마이그레이션 기준.
- **게임 데이터**: `../data/games.db`를 읽기 전용으로 직접 읽음 (크롤러가 쓰는 그 파일). 실서비스 단계에서 크롤러 출력을 Supabase로 동기화하는 파이프라인이 별도로 필요함 — 지금은 로컬 파일을 그대로 참조.
- **알림 발송/트리거 판정**: 아직 없음. 규칙 저장까지만 동작. Resend 계정이 생기면 크론 잡으로 조건 평가 + 발송 붙이기.
- **결제**: 없음. `users.plan`은 항상 `free`.

## 실행

```
cd dashboard
npm install
npm run dev
```

`data/games.db`가 상위 폴더에 있어야 한다 (크롤러 저장소 구조 그대로).
