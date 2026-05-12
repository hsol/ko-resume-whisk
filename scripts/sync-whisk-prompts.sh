#!/usr/bin/env bash
# skills/resume-* SKILL.md(프론트매터 제외) → web/prompts/*.system.md
# GitHub Actions 대신 pre-commit에서 호출합니다.
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
cd "$root"
mkdir -p web/prompts
tail -n +6 skills/resume-bubbler/SKILL.md > web/prompts/resume-bubbler.system.md
tail -n +6 skills/resume-debubbler/SKILL.md > web/prompts/resume-debubbler.system.md
