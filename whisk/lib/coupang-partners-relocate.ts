/** `PartnersCoupang.G`가 body 끝 등에 넣은 `ins`·`iframe`을 지정 host로 옮긴다. */
export function relocatePartnersWidgetNodes(
  host: HTMLElement,
  widgetId: number,
): void {
  const idPrefix = String(widgetId);
  const selectors = [
    `ins[id^="${idPrefix}"]`,
    `iframe[id^="${idPrefix}"]`,
  ];

  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (host.contains(node)) return;
      host.insertBefore(node, host.firstChild);
    });
  }

  // id 없이 body 직계로 붙는 ins — 스크립트 직전 형제로 삽입된 노드를 host로
  const runner = host.querySelector("script[data-coupang-runner]");
  if (!runner?.parentElement) return;

  let sibling = runner.previousElementSibling;
  while (sibling) {
    const tag = sibling.tagName;
    if (tag === "INS" || tag === "IFRAME") {
      if (!host.contains(sibling)) {
        host.insertBefore(sibling, host.firstChild);
      }
    }
    sibling = sibling.previousElementSibling;
  }
}

export function schedulePartnersWidgetRelocate(
  host: HTMLElement,
  widgetId: number,
): () => void {
  const run = () => relocatePartnersWidgetNodes(host, widgetId);
  const delays = [0, 80, 250, 600, 1200];
  const timers = delays.map((ms) => window.setTimeout(run, ms));

  const observer = new MutationObserver(run);
  observer.observe(document.body, { childList: true, subtree: true });
  const stopObserver = window.setTimeout(() => observer.disconnect(), 4000);

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    window.clearTimeout(stopObserver);
    observer.disconnect();
  };
}
