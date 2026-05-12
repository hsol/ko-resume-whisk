import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

/**
 * /sitemap.xml 자동 생성.
 *
 * 사이트맵은 "사이트가 검색엔진에 발견되길 원하는 핵심 페이지의 카탈로그"다.
 * 사용자 생성 snapshot 페이지는 의도적으로 포함하지 않는다.
 *
 * 이유:
 * 1. 스케일 문제 — 사용자가 늘면 sitemap 이 50,000 URL / 50MB 제한에 부딪힌다.
 *    매 요청마다 DB 전체 스캔이 발생하는 것도 부담.
 * 2. SEO 품질 신호 문제 — 가벼운 변환문 수만 개가 sitemap 에 올라오면
 *    Google 이 "low-quality user-generated content 가 사이트의 메인 콘텐츠"로
 *    오판할 위험이 있다. 사이트 전체 평판이 깎이면 메인 페이지 순위까지 동반 하락.
 *
 * snapshot 페이지는 robots 에서 막지 않으므로(layout/page 모두 index 허용),
 * 카카오톡·슬랙·트위터·블로그 등 외부 공유 링크로 발견되면 자연스럽게 인덱싱된다.
 *
 * 향후 노출 강화 옵션:
 * - 큐레이션된 "추천 변환문" 갤러리 페이지를 만들고 그 페이지만 sitemap 에 포함
 * - 메인 페이지에 "인기 snapshot" 섹션을 두어 내부 링크로 발견되게 하기
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
