"use client";

import { useEffect, useState } from "react";

export default function BenchmarkPage({ params }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/benchmark/${params.appId}`)
      .then((res) => res.json())
      .then(setData);
  }, [params.appId]);

  if (!data) return <p className="empty">불러오는 중…</p>;
  if (data.error) return <p className="empty">{data.error}</p>;

  return (
    <div>
      <h1>{data.target.name}</h1>
      <p className="subtitle">
        같은 장르({data.target.genres.join(", ")}) 코옵 인디게임 {data.cohort_size}개 대비 포지션
        ({data.window.min_d} → {data.window.max_d})
      </p>

      <div className="card">
        <table>
          <tbody>
            <tr>
              <th>리뷰 증가량</th>
              <td className="num">{data.target.growth > 0 ? "+" : ""}{data.target.growth}</td>
              <td className="num">상위 {100 - data.growth_percentile}%</td>
            </tr>
            <tr>
              <th>긍정률</th>
              <td className="num">{data.target.positive_pct}%</td>
              <td className="num">상위 {100 - data.positive_percentile}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>코호트 상위 게임</th><th className="num">증가량</th><th className="num">긍정률</th></tr>
          </thead>
          <tbody>
            {data.top_peers.map((p) => (
              <tr key={p.app_id} style={p.app_id === data.target.app_id ? { color: "var(--teal)" } : undefined}>
                <td>{p.name}</td>
                <td className="num">{p.growth > 0 ? "+" : ""}{p.growth}</td>
                <td className="num">{p.positive_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
