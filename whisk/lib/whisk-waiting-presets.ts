import {
  LANGUAGE_KO,
  LANGUAGE_RESUME,
  type LanguageKey,
} from "@/lib/resume-whisk-languages";

/** 한국어 → 자소서 (bubbler) 대기 중 after 영역 typed.js 순회용 */
export const WHISK_WAITING_PRESETS_KO_TO_RESUME: readonly string[] = [
  "프로덕션 크리티컬 장애를 선제적으로 감지함. 근본 원인 분석을 주도하여 서비스를 신속히 복구함.",
  "결제 시스템 구축 프로젝트에 핵심 인력으로 참여하여 테스트 전략 수립 및 결제 플로우 품질 검증을 수행함.",
  "AI 기반 개발 워크플로우를 선도적으로 도입함. 디버깅 프로세스를 혁신하여 장애 해결 시간을 단축함.",
  "End-to-end ownership으로 서비스를 architect하고, cross-functional 팀과 seamless하게 collaborate하여 프로젝트를 on-time deliver함.",
  "지속 가능한 성장을 위해 Strategic Pause를 선택, 업계 트렌드를 분석함. 신규 기술 스택을 자기 주도적으로 학습하며 커리어 재정비의 시기를 가짐.",
];

/** 자소서 → 한국어 (debubbler) 대기 중 after 영역 typed.js 순회용 */
export const WHISK_WAITING_PRESETS_RESUME_TO_KO: readonly string[] = [
  "제가 배포한 코드에 버그가 있어서 서버가 터졌습니다. 허겁지겁 로그 추적해서 고쳤습니다.",
  "시니어가 결제 시스템 만드는 것을 옆에서 구경했습니다. 저는 테스트할 때 카드번호 넣어주는 역할이었습니다.",
  "에러 메시지 복사해서 지피티한테 물어봤습니다. 알려준 코드 그대로 붙여넣기 했더니 됐습니다.",
  "기획서대로 만들었습니다. 다른 팀한테 필요한 거 있으면 슬랙으로 물어봤습니다.",
  "퇴사하고 3개월 동안 집에서 넷플릭스 보면서 쉬었습니다. 가끔 유튜브로 코딩 강의 틀어놨습니다.",
];

export function getWhiskWaitingPresetStrings(
  from: LanguageKey,
  to: LanguageKey,
): readonly string[] {
  if (from === LANGUAGE_KO && to === LANGUAGE_RESUME) {
    return WHISK_WAITING_PRESETS_KO_TO_RESUME;
  }
  if (from === LANGUAGE_RESUME && to === LANGUAGE_KO) {
    return WHISK_WAITING_PRESETS_RESUME_TO_KO;
  }
  return WHISK_WAITING_PRESETS_KO_TO_RESUME;
}
