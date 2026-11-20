import { playWave } from "@/components/fx/PageWave";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pathFor, type Lang } from "@/lib/i18n";
import logoPng from "@assets/logo.png";
import backgroundPhoto from "@assets/stock_images/Gemini_Generated_Image_x18mj0x18mj0x18m.webp";
import seafarersPhoto from "@assets/stock_images/seafarer_crew_workin_81b3ed0a.webp";
import seafarersSea from "@assets/stock_images/stormy_sea_3.webp";
import applySea from "@assets/stock_images/stormy_sea_2.webp";

// First visit: a full-screen choice of language, written in both languages. The site renders underneath and
// loads its pictures meanwhile, so it is ready the moment a language is picked. The choice is remembered in
// this browser (localStorage — not a cookie, nothing is sent anywhere); the UA | EN switch in the header updates it.

export const LANG_KEY = "aurasea-lang";

export function savedLang(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "uk" || v === "en" ? v : null;
  } catch {
    return null;
  }
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* storage unavailable: the choice is asked again next time */
  }
}

/** Search engines and link previews get the page itself, without the choice screen. */
const isBot = () => typeof navigator !== "undefined" && /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse/i.test(navigator.userAgent);

/** Pictures of the most visited pages, fetched while the visitor is choosing. */
const PRELOAD = [seafarersPhoto, seafarersSea, applySea];

/** Blue planet with meridians and parallels — the texture of the English button. The land drifts slowly behind the grid. */
function Globe() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className="pointer-events-none h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] flex-shrink-0 drop-shadow-[0_0_14px_rgba(102,228,245,0.45)]">
      <defs>
        <radialGradient id="globe-sea" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#4f8df5" />
          <stop offset="55%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0b1f5c" />
        </radialGradient>
        <radialGradient id="globe-shine" cx="35%" cy="28%" r="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="globe-clip">
          <circle cx="100" cy="100" r="96" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#globe-sea)" />
      <g clipPath="url(#globe-clip)">
        {/* two copies of the land side by side: moving by one copy loops seamlessly */}
        <g className="lang-globe-land" fill="#8fd0ff" fillOpacity="0.75">
          {[0, 200].map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <path d="M28 52c14-12 34-14 46-6 10 7 6 18 14 24 9 7 4 20-8 22-10 2-12 12-22 14-12 2-18-8-20-18-2-12-16-14-14-24 1-5 1-8 4-12z" />
              <path d="M70 112c10-4 22 0 26 10 4 9-2 16 2 26 3 8-4 18-12 20-7 2-10-8-12-16-3-10-12-14-12-24 0-8 2-13 8-16z" />
              <path d="M118 46c12-6 30-6 40 2 8 6 4 14 12 18 8 4 6 14-2 16-9 2-14 10-24 8-12-2-14-12-24-16-8-3-10-12-6-18 1-4 2-7 4-10z" />
              <path d="M132 104c10-6 26-4 30 6 3 8-4 12-2 20 2 9-6 16-14 14-9-2-10-12-16-18-6-6-6-16 2-22z" />
              <path d="M168 150c8-3 16 2 16 9 0 6-8 9-14 7-6-2-8-12-2-16z" />
            </g>
          ))}
        </g>
        {/* parallels */}
        <g fill="none" stroke="#cfe8ff" strokeOpacity="0.55" strokeWidth="1.1">
          {[-72, -48, -24, 0, 24, 48, 72].map((y) => (
            <ellipse key={y} cx="100" cy={100 + y} rx={Math.sqrt(96 * 96 - y * y)} ry={Math.sqrt(96 * 96 - y * y) * 0.16} />
          ))}
          {/* meridians */}
          {[0, 30, 58, 82].map((rx) => (
            <ellipse key={rx} cx="100" cy="100" rx={rx} ry="96" />
          ))}
        </g>
      </g>
      <circle cx="100" cy="100" r="96" fill="url(#globe-shine)" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="#9fd6ff" strokeOpacity="0.6" strokeWidth="1.5" />
    </svg>
  );
}

export default function LanguageGate({ lang }: { lang: Lang }) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(() => !isBot() && savedLang() === null);
  const firstButton = useRef<HTMLButtonElement>(null);

  // A visitor who chose before: open the page in their language (a shared Ukrainian link opens in English for them)
  useEffect(() => {
    const saved = savedLang();
    if (saved && saved !== lang) {
      const path = window.location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
      navigate("~" + pathFor(path, saved) + window.location.search + window.location.hash, { replace: true });
    }
    // only on the first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstButton.current?.focus();
    for (const src of PRELOAD) {
      const img = new Image();
      img.src = src;
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<Lang | null>(null);
  const choose = (chosen: Lang) => {
    if (picked) return;
    setPicked(chosen);
    saveLang(chosen);
    playWave();
    // A beat for the chosen button to answer before the screen dissolves into the site
    setTimeout(
      () => {
        if (chosen !== lang) {
          const path = window.location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
          navigate("~" + pathFor(path, chosen) + window.location.search, { replace: true });
        }
        setOpen(false);
      },
      reduce ? 0 : 280
    );
  };
  /** Each option rises in after the title; once one is picked it swells a little and the other steps back. */
  const option = (code: Lang, index: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: picked
      ? { opacity: picked === code ? 1 : 0.35, y: 0, scale: picked === code ? 1.04 : 0.98 }
      : { opacity: 1, y: 0, scale: 1 },
    transition: picked
      ? { type: "spring" as const, stiffness: 420, damping: 26 }
      : { delay: 0.45 + index * 0.12, type: "spring" as const, stiffness: 260, damping: 22 },
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 1 }}
          // The screen lifts away and blurs into the site underneath
          exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          data-testid="language-gate"
          onKeyDown={(e) => {
            // Esc keeps the language of the address opened; Tab stays inside the two buttons
            if (e.key === "Escape") return choose(lang);
            if (e.key !== "Tab") return;
            const buttons = Array.from(e.currentTarget.querySelectorAll("button"));
            const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
            e.preventDefault();
            buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
          }}
        >
          <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url(${backgroundPhoto})` }} />
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.18),transparent_55%)]" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative w-full max-w-2xl glass-premium rounded-3xl border border-white/15 p-8 sm:p-12 text-center shadow-[0_8px_48px_rgba(0,0,0,0.5)]"
          >
            <img src={logoPng} alt="AURA SEA" className="h-20 w-auto mx-auto mb-6" />
            <h2 id="language-gate-title" className="font-headline text-3xl sm:text-4xl font-bold text-white leading-tight">
              Оберіть мову
              <span className="block text-cyan-300 mt-1">Choose your language</span>
            </h2>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div {...option("uk", 0)}>
              <button
                ref={firstButton}
                type="button"
                lang="uk"
                onClick={() => choose("uk")}
                className="lang-btn-ua w-full relative overflow-hidden rounded-full px-8 py-6 min-h-[7rem] sm:min-h-[8rem] text-white transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                data-testid="language-gate-uk"
              >
                <span className="relative block text-2xl sm:text-3xl font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">Українська</span>
                <span className="relative block mt-1 text-base sm:text-lg font-light text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]">Ukrainian</span>
              </button>
              </motion.div>
              <motion.div {...option("en", 1)}>
              <button
                type="button"
                lang="en"
                onClick={() => choose("en")}
                className="lang-btn-en w-full relative overflow-hidden rounded-full px-8 py-6 min-h-[7rem] sm:min-h-[8rem] text-white transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                data-testid="language-gate-en"
              >
                <span className="relative flex items-center justify-center gap-4">
                  <Globe />
                  <span className="text-left">
                    <span className="block text-2xl sm:text-3xl font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">English</span>
                    <span className="block mt-1 text-base sm:text-lg font-light text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">International</span>
                  </span>
                </span>
              </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
