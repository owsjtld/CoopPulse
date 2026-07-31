"use client";

import { useEffect, useState } from "react";

const RULE_LABELS = {
  review_growth_pct: "장르 내 리뷰 성장률 급증",
  rating_drop: "워치리스트 게임 긍정률 급락",
  new_emerging: "내 장르에 신흥작 진입",
};

export default function AlertsPage() {
  const [rules, setRules] = useState(null);
  const [ruleType, setRuleType] = useState("review_growth_pct");
  const [threshold, setThreshold] = useState(20);
  const [channel, setChannel] = useState("email");
  const [webhookUrl, setWebhookUrl] = useState("");

  async function load() {
    const res = await fetch("/api/alerts");
    if (res.status === 401) { setRules([]); return; }
    const data = await res.json();
    setRules(data.rules);
  }

  useEffect(() => { load(); }, []);

  async function addRule(e) {
    e.preventDefault();
    const params = { threshold: Number(threshold) };
    if (channel === "webhook") params.webhook_url = webhookUrl;
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule_type: ruleType, params, channel }),
    });
    load();
  }

  async function removeRule(id) {
    await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (rules === null) return <p className="empty">불러오는 중…</p>;

  return (
    <div>
      <h1>알림 규칙</h1>
      <p className="subtitle">조건이 맞으면 개별 알림을 받습니다. 뉴스레터(주간 전체 공지)와는 별개입니다.</p>
      <div className="notice">
        알림은 유저별 개인 조건으로 트리거되는 트랜잭션 메일이라 뉴스레터(Buttondown)와는 다른
        발송 경로(Resend 등)가 필요합니다 — 지금은 규칙 저장까지만 동작하고, 실제 발송/트리거
        판정 로직은 Resend 계정 연동 이후 붙입니다.
      </div>

      <form className="card" onSubmit={addRule}>
        <div className="field">
          <label htmlFor="rule_type">조건</label>
          <select id="rule_type" value={ruleType} onChange={(e) => setRuleType(e.target.value)}>
            {Object.entries(RULE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="threshold">임계값 (%)</label>
          <input id="threshold" type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="channel">채널</label>
          <select id="channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="email">이메일</option>
            <option value="webhook">Discord/Slack 웹훅</option>
          </select>
        </div>
        {channel === "webhook" && (
          <div className="field">
            <label htmlFor="webhook_url">웹훅 URL</label>
            <input id="webhook_url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..." />
          </div>
        )}
        <button type="submit">규칙 추가</button>
      </form>

      <div className="card">
        {rules.length === 0 ? (
          <p className="empty">등록된 알림 규칙이 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr><th>조건</th><th>임계값</th><th>채널</th><th></th></tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <td>{RULE_LABELS[r.rule_type] || r.rule_type}</td>
                  <td className="num">{r.params.threshold}%</td>
                  <td>{r.channel}</td>
                  <td className="num">
                    <button className="secondary" onClick={() => removeRule(r.id)}>삭제</button>
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
