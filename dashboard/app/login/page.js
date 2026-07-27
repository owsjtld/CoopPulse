import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "../../lib/db";
import { sessionCookieName } from "../../lib/auth";

async function login(formData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email.includes("@")) return;
  getOrCreateUser(email);
  cookies().set(sessionCookieName(), email, { httpOnly: true, path: "/" });
  redirect("/");
}

export default function LoginPage() {
  return (
    <div>
      <h1>로그인</h1>
      <p className="subtitle">개발용 더미 로그인 — 비밀번호 없이 이메일만으로 세션 생성.</p>
      <div className="notice">
        실제 서비스 전환 시 이 페이지는 Supabase Auth(매직 링크)로 교체합니다.
        지금은 로컬 스켈레톤 검증용입니다.
      </div>
      <form action={login} className="card">
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <button type="submit">로그인 / 계정 생성</button>
      </form>
    </div>
  );
}
