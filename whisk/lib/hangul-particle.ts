const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;

/**
 * 목적어 조사: 마지막 음절에 받침이 있으면 "을", 없으면 "를".
 * (비한글 끝은 단순 휴리스틱)
 */
export function objectParticleEulReul(text: string): "을" | "를" {
  const s = text.trim();
  if (!s) return "을";
  const ch = s.at(-1);
  if (!ch) return "을";
  const cp = ch.codePointAt(0);
  if (cp === undefined) return "을";

  if (cp < HANGUL_SYLLABLE_START || cp > HANGUL_SYLLABLE_END) {
    return /[0-9LMNRlmnr]$/u.test(ch) ? "을" : "를";
  }

  const jong = (cp - HANGUL_SYLLABLE_START) % 28;
  return jong === 0 ? "를" : "을";
}
