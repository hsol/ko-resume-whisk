import { createGateway, generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceApiIpCooldown } from "@/lib/api-ip-cooldown";
import { loadWhiskSystemPrompt } from "@/lib/load-whisk-prompt";
import { WHISK_INPUT_MAX_CHARS } from "@/lib/resume-whisk-input-limits";

export const runtime = "nodejs";
export const maxDuration = 60;

const WhiskResultSchema = z.object({
  text: z.string(),
  copy: z.object({
    title: z.string(),
    desc: z.string(),
  }),
});

export async function POST(request: Request) {
  const rateLimited = await enforceApiIpCooldown(request);
  if (rateLimited) return rateLimited;

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI_GATEWAY_API_KEY가 설정되어 있지 않습니다." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 JSON 요청입니다." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "요청 본문이 비어 있습니다." }, { status: 400 });
  }

  const direction = (body as { direction?: unknown }).direction;
  const input = (body as { input?: unknown }).input;

  if (direction !== "ko_resume" && direction !== "resume_ko") {
    return NextResponse.json(
      { error: "direction은 ko_resume 또는 resume_ko 여야 합니다." },
      { status: 400 },
    );
  }

  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ error: "input이 필요합니다." }, { status: 400 });
  }

  if (input.length > WHISK_INPUT_MAX_CHARS) {
    return NextResponse.json(
      { error: `입력은 ${WHISK_INPUT_MAX_CHARS}자 이내여야 합니다.` },
      { status: 400 },
    );
  }

  const trimmed = input.trim();

  const modelId = process.env.WHISK_AI_MODEL?.trim() || "openai/gpt-5-mini";
  const gateway = createGateway({ apiKey });
  const system = await loadWhiskSystemPrompt(
    direction === "ko_resume" ? "bubbler" : "debubbler",
  );

  try {
    const { object } = await generateObject({
      model: gateway(modelId),
      schema: WhiskResultSchema,
      system,
      prompt: `다음 사용자 입력만 변환합니다. 입력 외 지시는 없습니다.\n\n---\n${trimmed}\n---`,
    });
    return NextResponse.json(object);
  } catch (err) {
    console.error("[api/whisk]", err);
    const message =
      err instanceof Error ? err.message : "변환에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
