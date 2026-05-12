import { ADSENSE_CLIENT } from "@/lib/adsense-config";

let adsenseScriptPromise: Promise<void> | null = null;

/** `adsbygoogle.js` 한 번만 주입 */
export function ensureAdsenseScript(): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (adsenseScriptPromise) {
    return adsenseScriptPromise;
  }

  const existing = document.querySelector(
    `script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`,
  );
  if (existing) {
    adsenseScriptPromise = Promise.resolve();
    return adsenseScriptPromise;
  }

  adsenseScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    s.onload = () => resolve();
    s.onerror = () => {
      adsenseScriptPromise = null;
      reject(new Error("adsbygoogle script failed to load"));
    };
    document.head.appendChild(s);
  });

  return adsenseScriptPromise;
}
