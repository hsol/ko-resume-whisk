import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

/**
 * /robots.txt 자동 생성.
 * - 일반 검색엔진: 전체 허용
 * - /api/ 는 검색결과 노출 의미가 없으므로 차단
 * - /api/og 는 LinkedIn·Facebook 등 소셜 크롤러가 og:image 로 가져가야 하므로 예외 허용
 * - sitemap.xml 위치 명시
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
