import { headers } from "next/headers";

/**
 * 운영·SEO용 절대 base URL (canonical, metadataBase, og:url, JSON-LD).
 *
 * 우선순위:
 * 1. `NEXT_PUBLIC_SITE_URL` — 프로덕션 커스텀 도메인 등을 명시할 때(가장 권장).
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel이 붙여 주는 **프로젝트 프로덕션 호스트**
 *    (연결된 커스텀 도메인이 있으면 그중 짧은 쪽, 없으면 프로덕션 vercel.app).
 *    배포별 `VERCEL_URL`(예: `*-xxx-hsol.vercel.app`)과 달리 공유·OG에 적합하다.
 * 3. `VERCEL_URL` — 로컬이 아닌 Vercel 런타임에서만, 위가 없을 때.
 * 4. `http://localhost:3000`
 *
 * @see https://vercel.com/docs/environment-variables/system-environment-variables
 */
function normalizeOrigin(urlOrHost: string): string {
  const t = urlOrHost.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(t)) {
    return t.replace(/\/$/, "");
  }
  const host = t.replace(/^\/+/, "");
  return `https://${host}`;
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return normalizeOrigin(explicit);
  }

  const productionHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    return normalizeOrigin(productionHost);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeOrigin(vercelUrl);
  }

  return "http://localhost:3000";
}

/**
 * 현재 요청 호스트 기준 절대 origin.
 * Vercel에 연결된 커스텀 도메인(bubble-resume.hsol.info 등)으로 접속했을 때
 * og:url·og:image·canonical 이 공유 URL과 같은 호스트를 가리키도록 한다.
 */
export async function getRequestSiteUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto") ??
        (host.includes("localhost") ? "http" : "https");
      return normalizeOrigin(`${proto}://${host.split(",")[0]!.trim()}`);
    }
  } catch {
    // headers() 는 요청 컨텍스트 밖(빌드·정적 생성)에서 실패할 수 있다.
  }
  return getSiteUrl();
}
