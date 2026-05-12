/** URL·헤더에 쓰는 패널 모드 키 */
export const LANGUAGE_KO = "ko" as const;
export const LANGUAGE_RESUME = "resume" as const;

export const Languages = {
  Korean: LANGUAGE_KO,
  Resume: LANGUAGE_RESUME,
} as const;

export type LanguageKey = (typeof LANGUAGE_KO) | (typeof LANGUAGE_RESUME);

export const LANGUAGE_LABEL_MAP: Record<LanguageKey, string> = {
  [LANGUAGE_KO]: "한국어",
  [LANGUAGE_RESUME]: "자소서",
};

export const DEFAULT_PANEL_FROM: LanguageKey = LANGUAGE_KO;
export const DEFAULT_PANEL_TO: LanguageKey = LANGUAGE_RESUME;

const LANGUAGE_KEYS = new Set<string>([LANGUAGE_KO, LANGUAGE_RESUME]);

export function parseLanguageKey(value: string | null): LanguageKey | null {
  if (value && LANGUAGE_KEYS.has(value)) {
    return value as LanguageKey;
  }
  return null;
}

export function resolvePanelLanguageKey(
  value: string | null,
  fallback: LanguageKey,
): LanguageKey {
  return parseLanguageKey(value) ?? fallback;
}
