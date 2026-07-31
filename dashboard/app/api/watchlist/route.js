import { NextResponse } from "next/server";
import { appDb, gamesDb } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const rows = appDb()
    .prepare("SELECT app_id, added_at FROM watchlist WHERE user_id = ? ORDER BY added_at DESC")
    .all(user.id);

  const games = gamesDb().prepare("SELECT app_id, name FROM games WHERE app_id = ?");
  const items = rows.map((r) => ({ ...r, game: games.get(r.app_id) || null }));

  return NextResponse.json({ items });
}

export async function POST(request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { app_id } = await request.json();
  if (!app_id) return NextResponse.json({ error: "app_id가 필요합니다." }, { status: 400 });

  appDb()
    .prepare("INSERT OR IGNORE INTO watchlist (user_id, app_id) VALUES (?, ?)")
    .run(user.id, app_id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { app_id } = await request.json();
  appDb().prepare("DELETE FROM watchlist WHERE user_id = ? AND app_id = ?").run(user.id, app_id);

  return NextResponse.json({ ok: true });
}
