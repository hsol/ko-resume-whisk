import { NextResponse } from "next/server";

import { getSql } from "@/lib/db";
import { isUuidV4 } from "@/lib/snapshot-id";
import { ensureSnapshotsTable } from "@/lib/snapshots-schema";

type Row = {
  id: string;
  ip: string | null;
  from: string;
  to: string;
  input_text: string;
  output_text: string;
  copy_title: string;
  copy_desc: string;
  created_at: Date;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isUuidV4(id)) {
    return NextResponse.json({ error: "잘못된 스냅샷 ID입니다" }, { status: 400 });
  }

  let sql;
  try {
    sql = getSql();
  } catch {
    return NextResponse.json(
      { error: "DB가 설정되지 않았습니다. vercel env pull 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }

  let rows: Row[];
  try {
    await ensureSnapshotsTable(sql);
    rows = (await sql`
      SELECT
        id,
        ip,
        "from",
        "to",
        input_text,
        output_text,
        copy_title,
        copy_desc,
        created_at
      FROM snapshots
      WHERE id = ${id}::uuid
    `) as Row[];
  } catch (e) {
    console.error("[snapshots GET]", e);
    return NextResponse.json({ error: "스냅샷을 불러오지 못했습니다" }, { status: 500 });
  }

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "스냅샷을 찾을 수 없습니다" }, { status: 404 });
  }

  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at);

  return NextResponse.json({
    id: row.id,
    from: row.from,
    to: row.to,
    input: row.input_text,
    output: row.output_text,
    copy_title: row.copy_title,
    copy_desc: row.copy_desc,
    created_at: createdAt,
  });
}
