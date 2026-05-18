import type { Metadata } from "next";

import { ResumeWhiskApp } from "@/components/resume-whisk-app";
import { getRequestSiteUrl, getSiteUrl } from "@/lib/site-url";
import { isUuidV4 } from "@/lib/snapshot-id";
import {
  buildSnapshotDescription,
  directionLabel,
  fetchSnapshotMeta,
  type SnapshotMeta,
} from "@/lib/snapshot-meta";

const OG_SIZE = { width: 1200, height: 630 } as const;
const SITE_NAME = "자소서 거품기";

type SearchParams = Promise<{ snapshot?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const snap = sp.snapshot;

  // 스냅샷이 아닌 메인 페이지: layout 의 기본 메타데이터를 그대로 사용한다.
  if (!snap || !isUuidV4(snap)) {
    return {};
  }

  const meta = await fetchSnapshotMeta(snap);
  if (!meta) {
    // 잘못된 스냅샷 id: 인덱싱을 막아 빈 페이지가 검색결과에 노출되지 않도록 한다.
    return {
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = await getRequestSiteUrl();
  const canonicalPath = `/?snapshot=${encodeURIComponent(snap)}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const ogImageUrl = `${siteUrl}/api/og?snapshot=${encodeURIComponent(snap)}`;
  const description = buildSnapshotDescription(meta);
  // title 은 layout 의 template("%s - 자소서 거품기") 에 의해 자동 결합된다.
  const title = meta.copy_title;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: `${title} - ${SITE_NAME}`,
      description,
      locale: "ko_KR",
      authors: ["yeol.dev"],
      publishedTime:
        meta.created_at instanceof Date
          ? meta.created_at.toISOString()
          : new Date(meta.created_at).toISOString(),
      images: [
        {
          url: ogImageUrl,
          ...OG_SIZE,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - ${SITE_NAME}`,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const snap = sp.snapshot;
  const snapMeta =
    snap && isUuidV4(snap) ? await fetchSnapshotMeta(snap) : null;

  return (
    <>
      <StructuredData snap={snap} snapMeta={snapMeta} />
      <ResumeWhiskApp />
    </>
  );
}

/**
 * JSON-LD 구조화 데이터.
 * 메인 페이지엔 WebApplication + WebSite 를, 스냅샷 페이지엔 CreativeWork 를 추가로 주입한다.
 * 검색엔진이 페이지 의미를 더 정확히 파악하도록 돕는다.
 */
function StructuredData({
  snap,
  snapMeta,
}: {
  snap: string | undefined;
  snapMeta: SnapshotMeta | null;
}) {
  const siteUrl = getSiteUrl();

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: "ko",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?snapshot={snapshot_id}`,
      "query-input": "required name=snapshot_id",
    },
  };

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: siteUrl,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    inLanguage: "ko",
    description:
      "평범한 일상 업무 기록을 이력서·자기소개서 문체로 바꿔 보여 주는 거품기.",
    creator: {
      "@type": "Person",
      name: "yeol.dev",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
  };

  const json: object[] = [webSite, webApp];

  if (snap && snapMeta) {
    const creativeWork = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: snapMeta.copy_title,
      headline: snapMeta.copy_title,
      description: snapMeta.copy_desc,
      url: `${siteUrl}/?snapshot=${encodeURIComponent(snap)}`,
      inLanguage: "ko",
      datePublished:
        snapMeta.created_at instanceof Date
          ? snapMeta.created_at.toISOString()
          : new Date(snapMeta.created_at).toISOString(),
      creator: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      text: snapMeta.output_text,
      about: {
        "@type": "Thing",
        name: `${directionLabel(snapMeta.from)} → ${directionLabel(snapMeta.to)}`,
      },
    };
    json.push(creativeWork);
  }

  return (
    <script
      type="application/ld+json"
      // 의도적으로 dangerouslySetInnerHTML 사용: JSON-LD 는 텍스트 노드여야 함.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
