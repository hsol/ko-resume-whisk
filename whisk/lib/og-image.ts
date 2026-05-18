/** LinkedIn·Facebook 최소 권장(520×270) 이상 — 표준 1.91:1 */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const OG_IMAGE_SIZE = {
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
} as const;

/** 메타데이터·ImageResponse 공통 경로(/api/ 아님 — robots 차단 회피) */
export const OG_IMAGE_PATH = "/og";

export function buildOgImageUrl(
  siteUrl: string,
  snapshotId?: string | null,
): string {
  const base = `${siteUrl.replace(/\/$/, "")}${OG_IMAGE_PATH}`;
  if (!snapshotId) return base;
  return `${base}?snapshot=${encodeURIComponent(snapshotId)}`;
}
