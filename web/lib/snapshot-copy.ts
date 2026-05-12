import { getSql } from "@/lib/db";
import { isUuidV4 } from "@/lib/snapshot-id";
import { ensureSnapshotsTable } from "@/lib/snapshots-schema";

/** OG·메타 등에서 스냅샷 카피만 조회 (실패 시 null) */
export async function fetchSnapshotCopyLines(
  id: string,
): Promise<{ copy_title: string; copy_desc: string } | null> {
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
      SELECT copy_title, copy_desc
      FROM snapshots
      WHERE id = ${id}::uuid
    `) as { copy_title: string; copy_desc: string }[];
    const row = rows[0];
    if (!row) return null;
    return { copy_title: row.copy_title, copy_desc: row.copy_desc };
  } catch {
    return null;
  }
}
