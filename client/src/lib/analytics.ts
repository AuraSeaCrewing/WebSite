// Visit statistics: Umami on our own server (stats.aurasea.org, CRM repo deploy/analytics-setup.sh).
// No cookies, visitors are not identified, bots are filtered out. Described in the Privacy Policy, section 13.
// Off until UMAMI_WEBSITE_ID is set (the setup script prints it).

const UMAMI_SRC = "https://stats.aurasea.org/insights.js";
export const UMAMI_WEBSITE_ID = "184d0d8a-0570-4aae-b18a-2b4eb45a41ca";

/** Load the counter on the live site only: local builds and previews are not counted. */
export function loadAnalytics() {
  if (!UMAMI_WEBSITE_ID || !/(^|\.)aurasea\.org$/.test(window.location.hostname)) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = UMAMI_SRC;
  s.dataset.websiteId = UMAMI_WEBSITE_ID;
  s.dataset.domains = "www.aurasea.org,aurasea.org";
  document.head.appendChild(s);
}

/** Count an action (e.g. an application sent). Does nothing if the counter is off or blocked. */
export function track(event: string) {
  try {
    (window as unknown as { umami?: { track: (e: string) => void } }).umami?.track(event);
  } catch {
    /* statistics must never break the page */
  }
}
