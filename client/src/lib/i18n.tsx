import { createContext, useContext, useEffect, type ReactNode } from "react";

// Two languages: Ukrainian at the site root (aurasea.org/about) — loads by default as the Law of Ukraine
// "On ensuring the functioning of the Ukrainian language" (Art. 27) requires — and English under /en (/en/about).
// Texts stay next to each other in the components: t("English", "Українська").

export type Lang = "uk" | "en";
export const LANGS: Lang[] = ["uk", "en"];
export const SITE = "https://www.aurasea.org";

const LangContext = createContext<Lang>("uk");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** t("English", "Українська") — the text for the current language. Works for strings and JSX. */
export function useT() {
  const lang = useLang();
  return <T,>(en: T, uk: T): T => (lang === "en" ? en : uk);
}

/** Full path of a page in a language: ("/about", "en") → "/en/about", ("/", "uk") → "/". */
export function pathFor(path: string, lang: Lang) {
  const clean = path === "" ? "/" : path;
  if (lang === "uk") return clean;
  return clean === "/" ? "/en" : `/en${clean}`;
}

function setMeta(selector: string, attr: string, value: string, create: () => HTMLElement) {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Title, description and language alternates of the current page for search engines and link previews.
 * `path` is the page path without the language prefix ("/about").
 */
export function usePageMeta(path: string, title: { en: string; uk: string }, description: { en: string; uk: string }) {
  const lang = useLang();
  useEffect(() => {
    const full = `${title[lang]} | AURA SEA`;
    document.title = full;
    const meta = (name: string, value: string, prop = false) =>
      setMeta(`meta[${prop ? "property" : "name"}="${name}"]`, "content", value, () => {
        const m = document.createElement("meta");
        m.setAttribute(prop ? "property" : "name", name);
        return m;
      });
    meta("description", description[lang]);
    meta("og:title", full, true);
    meta("og:description", description[lang], true);
    meta("og:url", SITE + pathFor(path, lang), true);
    meta("og:locale", lang === "uk" ? "uk_UA" : "en_US", true);
    const link = (key: string, rel: string, href: string, hreflang?: string) =>
      setMeta(`link[data-i18n="${key}"]`, "href", href, () => {
        const l = document.createElement("link");
        l.rel = rel;
        l.dataset.i18n = key;
        if (hreflang) l.hreflang = hreflang;
        return l;
      });
    link("canonical", "canonical", SITE + pathFor(path, lang));
    link("alt-uk", "alternate", SITE + pathFor(path, "uk"), "uk");
    link("alt-en", "alternate", SITE + pathFor(path, "en"), "en");
    link("alt-default", "alternate", SITE + pathFor(path, "uk"), "x-default");
  }, [lang, path, title.en, title.uk, description.en, description.uk]);
}
