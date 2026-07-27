import { NextResponse } from "next/server";
import { gamesDb } from "../../../lib/db";

export async function GET(request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const rows = gamesDb()
    .prepare(
      `SELECT app_id, name FROM games WHERE name LIKE ? ORDER BY name LIMIT 15`
    )
    .all(`%${q}%`);

  return NextResponse.json({ results: rows });
}
