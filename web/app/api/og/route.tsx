import { ImageResponse } from "next/og";

import {
  WHISK_TAGLINE_PRIMARY,
  WHISK_TAGLINE_SECONDARY,
} from "@/lib/resume-whisk-taglines";

export const runtime = "nodejs";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const COPY_MAX = 520;

const NOTO_KR_400_URL =
  "https://unpkg.com/@fontsource/noto-sans-kr@5.2.5/files/noto-sans-kr-korean-400-normal.woff";
const NOTO_KR_700_URL =
  "https://unpkg.com/@fontsource/noto-sans-kr@5.2.5/files/noto-sans-kr-korean-700-normal.woff";

function sanitizeCopy(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, COPY_MAX)
    .trimEnd();
}

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("copy");
  const copy = raw ? sanitizeCopy(raw) : "";

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
          background: "#f9f9f9",
          padding: 56,
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "#1a1f2c",
            marginBottom: copy ? 0 : 24,
            letterSpacing: -0.02,
          }}
        >
          자소서 거품기
        </div>
        {copy ? (
          <>
            <div
              style={{
                marginTop: 20,
                fontSize: 28,
                lineHeight: 1.52,
                color: "#1a1f2c",
                whiteSpace: "pre-wrap",
                fontWeight: 400,
                maxHeight: 300,
                overflow: "hidden",
              }}
            >
              {copy}
            </div>
            <div
              style={{
                marginTop: 28,
                paddingTop: 22,
                borderTop: "2px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#1a1f2c",
                  letterSpacing: -0.02,
                }}
              >
                {WHISK_TAGLINE_PRIMARY}
              </div>
              <div style={{ fontSize: 21, color: "#64748b", marginTop: 10, fontWeight: 400 }}>
                {WHISK_TAGLINE_SECONDARY}
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#1a1f2c",
                lineHeight: 1.15,
                marginBottom: 20,
                marginTop: 8,
                letterSpacing: -0.03,
              }}
            >
              {WHISK_TAGLINE_PRIMARY}
            </div>
            <div style={{ fontSize: 34, color: "#64748b", fontWeight: 400 }}>
              {WHISK_TAGLINE_SECONDARY}
            </div>
          </>
        )}
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
