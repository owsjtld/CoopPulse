import "./globals.css";

export const metadata = {
  title: "CoopPulse Dashboard",
  description: "코옵 인디게임 리뷰 데이터 — 유료 대시보드 (개발 스켈레톤)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div className="shell">
          <header className="topbar">
            <a href="/" className="wordmark">
              COOP<span>PULSE</span> <small>DASHBOARD</small>
            </a>
            <nav>
              <a href="/export">Export</a>
              <a href="/alerts">Alerts</a>
              <a href="/login">Login</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
