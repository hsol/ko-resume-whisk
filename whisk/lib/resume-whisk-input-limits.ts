/** before(입력) 최대 글자수 — UI `maxLength`·`/api/whisk`·스냅샷 POST와 동기화 */
export const WHISK_INPUT_MAX_CHARS = 300;

export function clampWhiskInput(value: string): string {
  if (value.length <= WHISK_INPUT_MAX_CHARS) return value;
  return value.slice(0, WHISK_INPUT_MAX_CHARS);
}
