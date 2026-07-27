"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function ExportForm() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const appId = searchParams.get("app_id");
    if (appId) {
      fetch(`/api/search?q=`).catch(() => {}); // no-op, appId already known
      setSelected({ app_id: Number(appId), name: `app_id ${appId}` });
    }
  }, [searchParams]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function loadPreview() {
    if (!selected) return;
    const params = new URLSearchParams({ format: "json" });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/export/${selected.app_id}?${params}`);
    if (res.status === 401) { setPreview({ error: "로그인이 필요합니다." }); return; }
    setPreview(await res.json());
  }

  function downloadCsv() {
    if (!selected) return;
    const params = new URLSearchParams({ format: "csv" });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.location.href = `/api/export/${selected.app_id}?${params}`;
  }

  return (
    <div>
      <h1>데이터 Export</h1>
      <p className="subtitle">게임별 일별 리뷰 추이를 CSV/JSON으로 내려받습니다.</p>

      <div className="card">
        <div className="field">
          <label htmlFor="search">게임 선택</label>
          <input
            id="search"
            value={selected ? selected.name : query}
            onChange={(e) => { setSelected(null); setQuery(e.target.value); }}
            placeholder="게임 이름 검색"
            autoComplete="off"
          />
        </div>
        {results.length > 0 && !selected && (
          <table>
            <tbody>
              {results.map((r) => (
                <tr key={r.app_id}>
                  <td>{r.name}</td>
                  <td className="num">
                    <button onClick={() => { setSelected(r); setResults([]); setQuery(""); }}>선택</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="field">
          <label htmlFor="from">시작일 (선택)</label>
          <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="to">종료일 (선택)</label>
          <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <button disabled={!selected} onClick={loadPreview}>미리보기</button>{" "}
        <button className="secondary" disabled={!selected} onClick={downloadCsv}>CSV 다운로드</button>
      </div>

      {preview && (
        <div className="card">
          {preview.error ? (
            <p className="empty">{preview.error}</p>
          ) : preview.rows.length === 0 ? (
            <p className="empty">해당 기간 데이터가 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr><th>날짜</th><th className="num">리뷰 수</th><th className="num">긍정률</th></tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.snapshot_date}>
                    <td>{r.snapshot_date}</td>
                    <td className="num">{r.review_count.toLocaleString()}</td>
                    <td className="num">{r.positive_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={<p className="empty">불러오는 중…</p>}>
      <ExportForm />
    </Suspense>
  );
}
