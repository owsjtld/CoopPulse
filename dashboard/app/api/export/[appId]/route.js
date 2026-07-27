import { NextResponse } from "next/server";
import { gamesDb } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

function toCsv(rows) {
  const header = "snapshot_date,review_count,positive_pct";
  const lines = rows.map((r) => `${r.snapshot_date},${r.review_count},${r.positive_pct}`);
  return [header, ...lines].join("\n");
}

export async function GET(request, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const appId = Number(params.appId);
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const format = url.searchParams.get("format") || "json";

  const db = gamesDb();
  const game = db.prepare("SELECT app_id, name FROM games WHERE app_id = ?").get(appId);
  if (!game) return NextResponse.json({ error: "게임을 찾을 수 없습니다." }, { status: 404 });

  let sql = "SELECT snapshot_date, review_count, positive_pct FROM review_snapshots WHERE app_id = ?";
  const args = [appId];
  if (from) { sql += " AND snapshot_date >= ?"; args.push(from); }
  if (to) { sql += " AND snapshot_date <= ?"; args.push(to); }
  sql += " ORDER BY snapshot_date";

  const rows = db.prepare(sql).all(...args);

  if (format === "csv") {
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${game.name}-${appId}.csv"`,
      },
    });
  }

  return NextResponse.json({ game, rows });
}
