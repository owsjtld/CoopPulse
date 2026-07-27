import { NextResponse } from "next/server";
import { gamesDb } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

function percentile(value, sortedArr) {
  if (sortedArr.length === 0) return null;
  const below = sortedArr.filter((v) => v <= value).length;
  return Math.round((below / sortedArr.length) * 100);
}

export async function GET(request, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const appId = Number(params.appId);
  const db = gamesDb();

  const target = db.prepare("SELECT app_id, name, genres FROM games WHERE app_id = ?").get(appId);
  if (!target) return NextResponse.json({ error: "게임을 찾을 수 없습니다." }, { status: 404 });

  const targetGenres = JSON.parse(target.genres || "[]");
  if (targetGenres.length === 0) {
    return NextResponse.json({ error: "이 게임은 장르 정보가 없어 코호트를 만들 수 없습니다." }, { status: 422 });
  }

  const allGames = db.prepare("SELECT app_id, name, genres FROM games").all();
  const cohortGames = allGames.filter((g) => {
    if (g.app_id === appId) return false;
    const genres = JSON.parse(g.genres || "[]");
    return genres.some((genre) => targetGenres.includes(genre));
  });

  const dateRow = db
    .prepare("SELECT MIN(snapshot_date) AS min_d, MAX(snapshot_date) AS max_d FROM review_snapshots")
    .get();

  function growthFor(id) {
    const rows = db
      .prepare(
        "SELECT review_count, positive_pct FROM review_snapshots WHERE app_id = ? AND snapshot_date IN (?, ?) ORDER BY snapshot_date"
      )
      .all(id, dateRow.min_d, dateRow.max_d);
    if (rows.length < 2) return null;
    return {
      growth: rows[1].review_count - rows[0].review_count,
      positive_pct: rows[1].positive_pct,
    };
  }

  const targetGrowth = growthFor(appId);
  const cohortWithGrowth = cohortGames
    .map((g) => ({ ...g, stats: growthFor(g.app_id) }))
    .filter((g) => g.stats);

  if (!targetGrowth) {
    return NextResponse.json({ error: "이 게임은 비교할 스냅샷이 아직 충분하지 않습니다." }, { status: 422 });
  }

  const growthValues = cohortWithGrowth.map((g) => g.stats.growth);
  const positiveValues = cohortWithGrowth.map((g) => g.stats.positive_pct);

  const growthPercentile = percentile(targetGrowth.growth, growthValues);
  const positivePercentile = percentile(targetGrowth.positive_pct, positiveValues);

  const topPeers = cohortWithGrowth
    .sort((a, b) => b.stats.growth - a.stats.growth)
    .slice(0, 8)
    .map((g) => ({ app_id: g.app_id, name: g.name, growth: g.stats.growth, positive_pct: g.stats.positive_pct }));

  return NextResponse.json({
    target: { ...target, genres: targetGenres, growth: targetGrowth.growth, positive_pct: targetGrowth.positive_pct },
    cohort_size: cohortWithGrowth.length,
    growth_percentile: growthPercentile,
    positive_percentile: positivePercentile,
    top_peers: topPeers,
    window: dateRow,
  });
}
