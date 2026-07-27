"use client";

import { useEffect, useState } from "react";

export default function DashboardHome() {
  const [loggedIn, setLoggedIn] = useState(null); // null = loading
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function loadWatchlist() {
    const res = await fetch("/api/watchlist");
    if (res.status === 401) {
      setLoggedIn(false);
      return;
    }
    setLoggedIn(true);
    const data = await res.json();
    setItems(data.items);
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

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

  async function addToWatchlist(app_id) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id }),
    });
    setQuery("");
    setResults([]);
    loadWatchlist();
  }

  async function removeFromWatchlist(app_id) {
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id }),
    });
    loadWatchlist();
  }

  if (loggedIn === null) return <p className="empty">불러오는 중…</p>;

  if (!loggedIn) {
    return (
      <div>
        <h1>대시보드</h1>
        <p className="subtitle">워치리스트를 보려면 로그인하세요.</p>
        <a className="btn" href="/login">로그인</a>
      </div>
    );
  }

  return (
    <div>
      <h1>내 워치리스트</h1>
      <p className="subtitle">관심 게임을 등록하면 export/벤치마킹으로 바로 이동할 수 있습니다.</p>

      <div className="card">
        <div className="field">
          <label htmlFor="search">게임 이름으로 검색</label>
          <input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: Palworld"
            autoComplete="off"
          />
        </div>
        {results.length > 0 && (
          <table>
            <tbody>
              {results.map((r) => (
                <tr key={r.app_id}>
                  <td>{r.name}</td>
                  <td className="num">
                    <button onClick={() => addToWatchlist(r.app_id)}>추가</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        {items.length === 0 ? (
          <p className="empty">아직 등록한 게임이 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>게임</th>
                <th>추가일</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.app_id}>
                  <td>{it.game?.name || `app_id ${it.app_id}`}</td>
                  <td>{it.added_at}</td>
                  <td className="num">
                    <a href={`/benchmark/${it.app_id}`}>벤치마킹</a>{" "}
                    <a href={`/export?app_id=${it.app_id}`}>export</a>{" "}
                    <button className="secondary" onClick={() => removeFromWatchlist(it.app_id)}>
                      제거
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
