import { NextResponse } from "next/server";
import { appDb } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const rows = appDb()
    .prepare("SELECT id, rule_type, params, channel, created_at FROM alert_rules WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id)
    .map((r) => ({ ...r, params: JSON.parse(r.params) }));

  return NextResponse.json({ rules: rows });
}

export async function POST(request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const { rule_type, params, channel } = body;
  if (!rule_type || !params) {
    return NextResponse.json({ error: "rule_type과 params가 필요합니다." }, { status: 400 });
  }

  appDb()
    .prepare("INSERT INTO alert_rules (user_id, rule_type, params, channel) VALUES (?, ?, ?, ?)")
    .run(user.id, rule_type, JSON.stringify(params), channel || "email");

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await request.json();
  appDb().prepare("DELETE FROM alert_rules WHERE id = ? AND user_id = ?").run(id, user.id);

  return NextResponse.json({ ok: true });
}
