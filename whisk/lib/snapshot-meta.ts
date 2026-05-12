import { getSql } from "@/lib/db";
import { isUuidV4 } from "@/lib/snapshot-id";
import { ensureSnapshotsTable } from "@/lib/snapshots-schema";

export type SnapshotDirection = "ko" | "resume";

export type SnapshotMeta = {
  copy_title: string;
  copy_desc: string;
  input_text: string;
  output_text: string;
  from: SnapshotDirection;
  to: SnapshotDirection;
  created_at: Date;
};

/**
 * SEO / 페이지 메타데이터용 스냅샷 조회.
 * OG 라우트의 `fetchSnapshotCopyLines` 와 달리 input/output 등 풀필드를 가져온다.
 * 실패 시 null (잘못된 id, DB 미설정, 미존재 모두 동일하게 처리).
 */
export async function fetchSnapshotMeta(
  id: string,
): Promise<SnapshotMeta | null> {
  if (!isUuidV4(id)) return null;

  let sql;
  try {
    sql = getSql();
  } catch {
    return null;
  }

  try {
    await ensureSnapshotsTable(sql);
    const rows = (await sql`
      SELECT copy_title, copy_desc, input_text, output_text, "from", "to", created_at
      FROM snapshots
      WHERE id = ${id}::uuid
    `) as SnapshotMeta[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

const DIRECTION_LABEL: Record<SnapshotDirection, string> = {
  ko: "한국어 평문",
  resume: "자소서 문체",
};

export function directionLabel(d: SnapshotDirection): string {
  return DIRECTION_LABEL[d];
}

/**
 * 검색결과/SNS 카드용 설명문 빌더.
 * input 과 output 을 자연스럽게 합쳐 한 줄(약 150자 내외)로 노출시킨다.
 * 검색엔진이 input/output 텍스트 자체를 인덱싱하도록 본문에 핵심 키워드를 노출하는 게 목적.
 */
export function buildSnapshotDescription(meta: SnapshotMeta): string {
  const inputSnippet = truncate(stripNewlines(meta.input_text), 70);
  const outputSnippet = truncate(stripNewlines(meta.output_text), 70);
  return `${meta.copy_desc} — “${inputSnippet}” → “${outputSnippet}”`;
}

function stripNewlines(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}
