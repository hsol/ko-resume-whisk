/**
 * 운영 도메인 baseURL을 한 곳에서 계산한다.
 * 우선순위: NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
 *
 * Vercel Preview 빌드 시 VERCEL_URL 은 자동 설정되고,
 * 운영 빌드는 NEXT_PUBLIC_SITE_URL 을 명시적으로 박는 것을 권장한다.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
