import { neon } from "@neondatabase/serverless";

type Sql = ReturnType<typeof neon>;

function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL
  );
}

let sql: Sql | undefined;

/** Neon HTTP SQL 클라이언트. `pnpm env:pull`로 `.env.local`에 `DATABASE_URL` 등이 있어야 합니다. */
export function getSql(): Sql {
  if (!sql) {
    const url = resolveDatabaseUrl();
    if (!url) {
      throw new Error(
        "DATABASE_URL(또는 POSTGRES_URL)이 없습니다. web에서 vercel link 후 pnpm env:pull을 실행하세요."
      );
    }
    sql = neon(url);
  }
  return sql;
}
