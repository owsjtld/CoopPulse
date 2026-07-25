import re
from datetime import datetime, timezone

from db import get_conn

README_PATH = "README.md"
CLAUDE_PATH = "CLAUDE.md"

MARKER = re.compile(r"<!-- STATUS:START -->.*?<!-- STATUS:END -->", re.DOTALL)


def replace_status(path, block):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = MARKER.sub(f"<!-- STATUS:START -->\n{block}\n<!-- STATUS:END -->", content)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    conn = get_conn()
    total_games = conn.execute("SELECT COUNT(*) FROM games").fetchone()[0]
    today = datetime.now(timezone.utc).date().isoformat()
    today_snapshots = conn.execute(
        "SELECT COUNT(*) FROM review_snapshots WHERE snapshot_date=?", (today,)
    ).fetchone()[0]
    conn.close()

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    readme_block = (
        f"- 마지막 갱신: {now_str}\n"
        f"- 추적 중인 코옵+인디 게임: **{total_games}개**\n"
        f"- {today}자 리뷰 스냅샷: {today_snapshots}개"
    )
    replace_status(README_PATH, readme_block)

    claude_block = (
        f"{now_str} 기준 추적 게임 {total_games}개 (SteamSpy Co-op 태그 로컬 전량 스캔 진행 중 — "
        f"남은 후보는 다음 로컬/수동 실행에서 이어서 처리)."
    )
    replace_status(CLAUDE_PATH, claude_block)

    print(f"[finalize] 문서 갱신 완료 - 게임 {total_games}개, 오늘자 스냅샷 {today_snapshots}개")


if __name__ == "__main__":
    main()
