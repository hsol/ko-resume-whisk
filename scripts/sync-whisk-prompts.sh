#!/usr/bin/env bash
# skills/resume-* SKILL.md(프론트매터 제외) → whisk/prompts/*.system.md
# GitHub Actions 대신 pre-commit에서 호출합니다.
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
cd "$root"
mkdir -p whisk/prompts
tail -n +6 skills/resume-bubbler/SKILL.md > whisk/prompts/resume-bubbler.system.md
tail -n +6 skills/resume-debubbler/SKILL.md > whisk/prompts/resume-debubbler.system.md
