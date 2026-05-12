import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Turbopack이 `web/`을 항상 루트로 쓰도록 고정 (잘못된 워크스페이스 추론 방지) */
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
