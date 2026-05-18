import { ImageResponse } from "next/og";

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/og-image";
import {
  WHISK_TAGLINE_PRIMARY,
  WHISK_TAGLINE_SECONDARY,
} from "@/lib/resume-whisk-taglines";
import { fetchSnapshotCopyLines } from "@/lib/snapshot-copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 소셜 크롤러 재요청·CDN 캐시용 */
const OG_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

/** 1200×630 캔버스 기준 가독성(LinkedIn 미리보기용) */
const FONT_TAGLINE_PRIMARY = 112;
const FONT_TAGLINE_SECONDARY = 68;

const NOTO_KR_400_URL =
  "https://unpkg.com/@fontsource/noto-sans-kr@5.2.5/files/noto-sans-kr-korean-400-normal.woff";
const NOTO_KR_700_URL =
  "https://unpkg.com/@fontsource/noto-sans-kr@5.2.5/files/noto-sans-kr-korean-700-normal.woff";

async function loadKoreanFonts(): Promise<[ArrayBuffer, ArrayBuffer]> {
  const [r400, r700] = await Promise.all([
    fetch(NOTO_KR_400_URL, { next: { revalidate: 60 * 60 * 24 } }),
    fetch(NOTO_KR_700_URL, { next: { revalidate: 60 * 60 * 24 } }),
  ]);
  if (!r400.ok || !r700.ok) {
    throw new Error(`font fetch failed: ${r400.status} / ${r700.status}`);
  }
  return [await r400.arrayBuffer(), await r700.arrayBuffer()];
}

function truncateOgLine(s: string, maxChars: number): string {
  const t = s.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars - 1)}…`;
}

export async function GET(request: Request) {
  const snapshotId = new URL(request.url).searchParams.get("snapshot");
  let primary = WHISK_TAGLINE_PRIMARY;
  let secondary = WHISK_TAGLINE_SECONDARY;

  if (snapshotId) {
    const copy = await fetchSnapshotCopyLines(snapshotId);
    if (copy) {
      primary = truncateOgLine(copy.copy_title, 72);
      secondary = truncateOgLine(copy.copy_desc, 120);
    }
  }

  let font400: ArrayBuffer;
  let font700: ArrayBuffer;
  try {
    [font400, font700] = await loadKoreanFonts();
  } catch {
    return new Response("OG font load failed", { status: 502 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9f9f9",
          padding: 56,
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: OG_IMAGE_WIDTH - 112,
          }}
        >
          <div
            style={{
              fontSize: FONT_TAGLINE_PRIMARY,
              fontWeight: 700,
              color: "#1a1f2c",
              lineHeight: 1.12,
              marginBottom: 28,
              letterSpacing: -0.03,
            }}
          >
            {primary}
          </div>
          <div
            style={{
              fontSize: FONT_TAGLINE_SECONDARY,
              color: "#64748b",
              fontWeight: 400,
              lineHeight: 1.32,
            }}
          >
            {secondary}
          </div>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      headers: {
        "Cache-Control": OG_CACHE_CONTROL,
      },
      fonts: [
        {
          name: "Noto Sans KR",
          data: font400,
          style: "normal",
          weight: 400,
        },
        {
          name: "Noto Sans KR",
          data: font700,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
