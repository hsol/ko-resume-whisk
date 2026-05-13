<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- 이 워크스페이스에서는 사용자에게 한국어로 안내하고, 앱 메타데이터·`html lang` 등 노출 문자열도 한국어 기준에 맞출 것.
- Vercel 배포는 Git 저장소 연동을 전제로 하고, Next 앱 루트는 프로젝트 설정에서 **Root Directory = `whisk`**로 둘 것 (`vercel.json`의 `rootDirectory`는 현재 OpenAPI 스키마에서 추가 속성으로 거부됨).
- `.cursor/` 디렉터리는 저장소에 포함하지 않음.
- 제품 카피와 도메인 용어는 「자소서」 중심으로 통일하고, 자소서 방향 키는 `resume`(과거 `cover` 대신)로 둠.
- 반응형 폭·브레이크포인트는 임의 픽셀 `max-width`보다 Tailwind 기본(`sm` 등)을 우선할 것.
- UI 재사용이 필요하면 클래스 문자열만 공유하지 말고 작은 컴포넌트로 분리할 것.
- GA4는 `NEXT_PUBLIC_GA_MEASUREMENT_ID`만 사용하고, 서버 전용 `GA_MEASUREMENT_ID` 분기는 두지 않음.

## Learned Workspace Facts

- Next.js 앱·`package.json`·빌드는 모두 `whisk/` 하위이며, 로컬 개발은 `cd whisk` 후 **pnpm**으로 스크립트를 실행하는 흐름이 맞음(`pnpm-lock.yaml` 기준, 예: `pnpm dev`, `pnpm lint`, `pnpm build`).
- 에이전트용 학습 메모(`AGENTS.md`)는 저장소 루트가 아니라 **`whisk/AGENTS.md`**에 둠.
- GitHub 원격 저장소는 `hsol/ko-resume-whisk`로 쓰이고, Vercel 프로젝트는 `ko-resume-whisk`(스코프 `hsol`)와 링크되는 전제가 잡혀 있음.
- AI Gateway 데모 스크립트는 `whisk/index.mjs`에서 `createGateway`와 환경 변수 `AI_GATEWAY_API_KEY`를 사용하는 패턴으로 정리됨.
- `whisk/.env.local`과 `whisk/.vercel`은 gitignore로 커밋에서 제외되며, 키 이름 안내는 `whisk/.env.example`에 둠.
- 스타일 스택은 Tailwind CSS v4와 shadcn/ui(Radix 기반)이며, 자소서 거품기 메인 UI는 `whisk/components/resume-whisk-app.tsx`에 있음.
- Neon Postgres는 Vercel과 연동된 뒤 `vercel env pull`로 로컬에서 DB 환경 변수를 맞추는 전제가 잡혀 있음.
- LLM 번역용 스킬 원문은 저장소 루트 `skills/resume-bubbler`, `skills/resume-debubbler`이며, `whisk/prompts/*.system.md`는 pre-commit 훅으로 스킬에서 동기화함(GitHub Actions 자동 커밋 워크플로는 사용하지 않음).
- 공유 스냅샷은 DB `snapshots`에 저장하고 공유 URL은 `snapshot` 쿼리 중심으로 두며, `from`/`to`/`copy`를 URL에 실지 않는 방향으로 정리됨.
- Google AdSense 클라이언트·슬롯 상수는 `whisk/lib/adsense-config.ts`, 스크립트 로더는 `whisk/lib/adsense-script.ts`, 클라이언트 표시 단위는 `whisk/components/ads/` 아래에 둠.
