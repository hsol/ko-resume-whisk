/**
 * 번역 결과가 준비된 직후 하단 공유 CTA 버튼에 노출하는 강한 넛지 카피 풀.
 * 이력서 거품기 본 주제(자소서·공백기·취준·이직·퇴사 충동·면접)와 묶어
 * "단톡방 떡밥형" 톤을 유지. 한 줄 라벨이므로 16자 안팎으로 유지.
 */
export const WHISK_SHARE_NUDGE_LABELS: readonly string[] = [
  "쉬었음 청년 단톡방에 풀기",
  "자소서 쓰는 친구한테 처방하기",
  "퇴사모(퇴사하고싶은 ...)에 공유하기",
  "취준 친구 멘탈 케어하기",
  "이직 고민러한테 슬쩍 영업하기",
  "사수 몰래 동기에게 DM 보내기",
  "면접 앞둔 친구에게 부적삼아주기",
  "야근 단톡에 위로 한 줄 풀어주기",
  "동료 자소서에 거품 한 스푼 얹어주기",
  "내 공백기 변호 해보기",
];

export function pickWhiskShareNudgeLabel(): string {
  const pool = WHISK_SHARE_NUDGE_LABELS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? pool[0]!;
}
