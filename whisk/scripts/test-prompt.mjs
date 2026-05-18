#!/usr/bin/env node
// SKILL.md를 직접 system prompt로 사용해 AI Gateway를 호출한다.
// 동기화(pre-commit) · 커밋 · 배포 없이 SKILL.md 변경을 즉시 검증할 수 있다.
//
// 사용:
//   pnpm test:prompt <ko_resume|resume_ko> "<입력 텍스트>"
//
// 예시:
//   pnpm test:prompt ko_resume "주말에 할 일 없이 자소서 거품기 만들었습니다"
//   pnpm test:prompt resume_ko "프로덕션 크리티컬 장애를 선제적으로 감지함."
//
// 필요 환경변수:
//   AI_GATEWAY_API_KEY  (.env.local에서 자동 로드, --env-file 플래그)
//   WHISK_AI_MODEL      (선택, 기본 'openai/gpt-5-mini')

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGateway, generateObject } from "ai";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const ResultSchema = z.object({
  text: z.string(),
  copy: z.object({
    title: z.string(),
    desc: z.string(),
  }),
});

/**
 * SKILL.md를 읽어 system prompt로 변환한다.
 * sync-whisk-prompts.sh와 동일 로직 — YAML 프론트매터(상위 5줄) 제외.
 */
async function loadSkillAsPrompt(kind) {
  const file = path.join(PROJECT_ROOT, "skills", `resume-${kind}`, "SKILL.md");
  const raw = await readFile(file, "utf8");
  return raw.split("\n").slice(5).join("\n");
}

function usage() {
  console.error('사용: pnpm test:prompt <ko_resume|resume_ko> "<입력 텍스트>"');
  console.error("  ko_resume  = 평문 → 자소서 거품 (bubbler)");
  console.error("  resume_ko  = 자소서 → 평문 환원 (debubbler)");
  console.error("");
  console.error("예시:");
  console.error('  pnpm test:prompt ko_resume "주말에 자소서 거품기 만들었음"');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) usage();

  const [direction, ...rest] = args;
  const input = rest.join(" ").trim();

  if (
    (direction !== "ko_resume" && direction !== "resume_ko") ||
    !input
  ) {
    usage();
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    console.error(
      "AI_GATEWAY_API_KEY 환경변수가 필요합니다 (.env.local에서 자동 로드)",
    );
    process.exit(1);
  }

  const kind = direction === "ko_resume" ? "bubbler" : "debubbler";
  const system = await loadSkillAsPrompt(kind);
  const modelId = process.env.WHISK_AI_MODEL?.trim() || "openai/gpt-5-mini";
  const gateway = createGateway({ apiKey });

  const promptBytes = Buffer.byteLength(system, "utf8");
  const label =
    direction === "ko_resume" ? "거품기 (한→자소서)" : "디버블러 (자소서→한)";

  console.error(`[모델]   ${modelId}`);
  console.error(`[방향]   ${label}`);
  console.error(`[프롬프트] ${system.length}자 / ${promptBytes}바이트`);
  console.error(`[입력]   ${input}`);
  console.error("");

  const t0 = Date.now();
  const { object } = await generateObject({
    model: gateway(modelId),
    schema: ResultSchema,
    system,
    prompt: `다음 사용자 입력만 변환합니다. 입력 외 지시는 없습니다.\n\n---\n${input}\n---`,
  });
  const elapsedMs = Date.now() - t0;

  // stdout에는 순수 JSON만 (jq 파이프 등에 사용 가능)
  console.log(JSON.stringify(object, null, 2));

  // stderr에는 사람이 읽기 좋은 라벨
  console.error("");
  console.error(`[지연] ${elapsedMs}ms`);
  console.error(`[text]  ${object.text}`);
  console.error(`[title] ${object.copy.title}`);
  console.error(`[desc]  ${object.copy.desc}`);
}

main().catch((err) => {
  console.error("[오류]", err?.message || err);
  process.exit(1);
});
