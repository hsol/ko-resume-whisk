import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getClientIp } from "@/lib/client-ip";
import { getSql } from "@/lib/db";
import { ensureSnapshotsTable } from "@/lib/snapshots-schema";

const bodySchema = z.object({
  from: z.enum(["ko", "resume"]),
  to: z.enum(["ko", "resume"]),
  input: z.string().max(100_000),
  output: z.string().max(100_000),
  copy_title: z.string().max(500),
  copy_desc: z.string().max(2_000),
});

export async function POST(request: Request) {
  let sql;
  try {
    sql = getSql();
  } catch {
    return NextResponse.json(
      { error: "DB가 설정되지 않았습니다. vercel env pull 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { from, to, input, output, copy_title, copy_desc } = parsed.data;
  const id = randomUUID();
  const ip = getClientIp(request);

  try {
    await ensureSnapshotsTable(sql);
    await sql`
      INSERT INTO snapshots (id, ip, "from", "to", input_text, output_text, copy_title, copy_desc)
      VALUES (
        ${id}::uuid,
        ${ip},
        ${from},
        ${to},
        ${input},
        ${output},
        ${copy_title},
        ${copy_desc}
      )
    `;
  } catch (e) {
    console.error("[snapshots POST]", e);
    return NextResponse.json({ error: "스냅샷 저장에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ id });
}
