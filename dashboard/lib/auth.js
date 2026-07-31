import { cookies } from "next/headers";
import { getOrCreateUser } from "./db";

// 개발용 더미 인증 — 실제 서비스 전환 시 Supabase Auth로 교체.
// 쿠키에 이메일만 저장하고 비밀번호/검증 없음. 프로덕션에 절대 이 상태로 배포하지 말 것.
const COOKIE_NAME = "cooppulse_dev_session";

export function getCurrentUser() {
  const email = cookies().get(COOKIE_NAME)?.value;
  if (!email) return null;
  return getOrCreateUser(email);
}

export function sessionCookieName() {
  return COOKIE_NAME;
}
