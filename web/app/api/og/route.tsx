import { ImageResponse } from "next/og";

import {
  WHISK_TAGLINE_PRIMARY,
  WHISK_TAGLINE_SECONDARY,
} from "@/lib/resume-whisk-taglines";

export const runtime = "nodejs";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/** 이전 OG 대비 1.5배 */
const FONT_TAGLINE_PRIMARY = Math.round(56 * 1.5);
const FONT_TAGLINE_SECONDARY = Math.round(34 * 1.5);

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

export async function GET() {
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
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9f9f9",
          padding: 48,
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              fontSize: FONT_TAGLINE_PRIMARY,
              fontWeight: 700,
              color: "#1a1f2c",
              lineHeight: 1.15,
              marginBottom: 24,
              letterSpacing: -0.03,
            }}
          >
            {WHISK_TAGLINE_PRIMARY}
          </div>
          <div
            style={{
              fontSize: FONT_TAGLINE_SECONDARY,
              color: "#64748b",
              fontWeight: 400,
              lineHeight: 1.35,
            }}
          >
            {WHISK_TAGLINE_SECONDARY}
          </div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
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
