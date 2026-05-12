type Sql = ReturnType<typeof import("@neondatabase/serverless").neon>;

let ensured: Promise<void> | undefined;

/** 최초 API 호출 시 idempotent 로 snapshots 테이블 생성 */
export function ensureSnapshotsTable(sql: Sql): Promise<void> {
  if (!ensured) {
    ensured = sql`
      CREATE TABLE IF NOT EXISTS snapshots (
        id uuid PRIMARY KEY,
        ip text,
        "from" text NOT NULL,
        "to" text NOT NULL,
        input_text text NOT NULL,
        output_text text NOT NULL,
        copy_title text NOT NULL,
        copy_desc text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return ensured;
}
