import { NextResponse } from "next/server";

import { OG_IMAGE_PATH } from "@/lib/og-image";

/** 이전 /api/og URL 호환 — 소셜·북마크 리다이렉트 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL(OG_IMAGE_PATH, url.origin);
  url.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return NextResponse.redirect(target, 308);
}
