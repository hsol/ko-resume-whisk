import { readFile } from "fs/promises";
import path from "path";

const cache = new Map<string, string>();

/**
 * `skills/resume-bubbler` / `skills/resume-debubbler` 본문을 `web/prompts/*.system.md`에
 * 복사해 두고 런타임에 읽습니다(Vercel Root Directory가 `web`일 때 배포 포함).
 */
export async function loadWhiskSystemPrompt(
  kind: "bubbler" | "debubbler",
): Promise<string> {
  const cached = cache.get(kind);
  if (cached) return cached;
  const filename =
    kind === "bubbler"
      ? "resume-bubbler.system.md"
      : "resume-debubbler.system.md";
  const filePath = path.join(process.cwd(), "prompts", filename);
  const text = await readFile(filePath, "utf8");
  cache.set(kind, text);
  return text;
}
