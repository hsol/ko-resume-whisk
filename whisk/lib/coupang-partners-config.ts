/** 쿠팡 파트너스 — resume-whisk */

export const COUPANG_PARTNERS_TRACKING_CODE = "AF2488038";

export type CoupangPartnersWidgetConfig = {
  id: number;
  template: string;
  trackingCode: string;
  width: string;
  height: string;
  tsource: string;
};

/** 태블릿 이상 레이아웃 상단 캐러셀 (680×100) */
export const COUPANG_TOP_BANNER_WIDGET: CoupangPartnersWidgetConfig = {
  id: 989882,
  template: "carousel",
  trackingCode: COUPANG_PARTNERS_TRACKING_CODE,
  width: "680",
  height: "100",
  tsource: "",
};

/** 하단 번역 CTA 자리 캐러셀 (360×80) */
export const COUPANG_TRANSLATE_CTA_WIDGET: CoupangPartnersWidgetConfig = {
  id: 989880,
  template: "carousel",
  trackingCode: COUPANG_PARTNERS_TRACKING_CODE,
  width: "360",
  height: "80",
  tsource: "",
};

/** 공유 링크 준비 다이얼로그 캐러셀 */
export const COUPANG_SHARE_DIALOG_WIDGET: CoupangPartnersWidgetConfig = {
  id: 989881,
  template: "carousel",
  trackingCode: COUPANG_PARTNERS_TRACKING_CODE,
  width: "360",
  height: "390",
  tsource: "",
};
