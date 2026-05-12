<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- 이 워크스페이스에서는 사용자에게 한국어로 안내하고, 앱 메타데이터·`html lang` 등 노출 문자열도 한국어 기준에 맞출 것.
- Vercel 배포는 Git 저장소 연동을 전제로 하고, Next 앱 루트는 프로젝트 설정에서 **Root Directory = `whisk`**로 둘 것 (`vercel.json`의 `rootDirectory`는 현재 OpenAPI 스키마에서 추가 속성으로 거부됨).
- `.cursor/` 디렉터리는 저장소에 포함하지 않음.

## Learned Workspace Facts

- Next.js 앱·`package.json`·빌드는 모두 `whisk/` 하위이며, 로컬 개발은 `cd whisk` 후 **pnpm**으로 스크립트를 실행하는 흐름이 맞음(`pnpm-lock.yaml` 기준, 예: `pnpm dev`, `pnpm lint`, `pnpm build`).
- 에이전트용 학습 메모(`AGENTS.md`)는 저장소 루트가 아니라 **`whisk/AGENTS.md`**에 둠.
- GitHub 원격 저장소는 `hsol/ko-resume-whisk`로 쓰이고, Vercel 프로젝트는 `ko-resume-whisk`(스코프 `hsol`)와 링크되는 전제가 잡혀 있음.
- AI Gateway 데모 스크립트는 `whisk/index.mjs`에서 `createGateway`와 환경 변수 `AI_GATEWAY_API_KEY`를 사용하는 패턴으로 정리됨.
- `whisk/.env.local`과 `whisk/.vercel`은 gitignore로 커밋에서 제외되며, 키 이름 안내는 `whisk/.env.example`에 둠.
- 스타일 스택은 Tailwind CSS v4와 shadcn/ui(Radix 기반)이며, 자소서 거품기 메인 UI는 `whisk/components/resume-whisk-app.tsx`에 있음.
