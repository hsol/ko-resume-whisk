const COUPANG_G_SCRIPT =
  "https://ads-partners.coupang.com/g.js";

let coupangScriptPromise: Promise<void> | null = null;

/** `g.js` 한 번만 로드 */
export function ensureCoupangPartnersScript(): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (coupangScriptPromise) {
    return coupangScriptPromise;
  }

  const existing = document.querySelector(
    `script[src="${COUPANG_G_SCRIPT}"]`,
  );
  if (existing) {
    coupangScriptPromise = Promise.resolve();
    return coupangScriptPromise;
  }

  coupangScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = COUPANG_G_SCRIPT;
    s.onload = () => resolve();
    s.onerror = () => {
      coupangScriptPromise = null;
      reject(new Error("Coupang Partners g.js failed to load"));
    };
    document.head.appendChild(s);
  });

  return coupangScriptPromise;
}
