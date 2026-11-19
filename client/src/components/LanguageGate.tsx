import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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

  const choose = (chosen: Lang) => {
    saveLang(chosen);
    if (chosen !== lang) {
      const path = window.location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
      navigate("~" + pathFor(path, chosen) + window.location.search, { replace: true });
    }
    setOpen(false);
  };

  const options: { code: Lang; label: string; note: string }[] = [
    { code: "uk", label: "Українська", note: "Україна" },
    { code: "en", label: "English", note: "International" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          data-testid="language-gate"
        >
          <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url(${backgroundPhoto})` }} />
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.18),transparent_55%)]" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, transition: { duration: 0.4 } }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative w-full max-w-xl glass-premium rounded-3xl border border-white/15 p-8 sm:p-12 text-center shadow-[0_8px_48px_rgba(0,0,0,0.5)]"
          >
            <img src={logoPng} alt="AURA SEA" className="h-20 w-auto mx-auto mb-6" />
            <h1 id="language-gate-title" className="font-headline text-2xl sm:text-3xl font-bold text-white leading-tight">
              Оберіть мову
              <span className="block text-cyan-300 mt-1">Choose your language</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/75 font-light leading-relaxed">
              Крюїнг з турботою — від моряків морякам
              <span className="block">Crewing with Care — from seafarers to seafarers</span>
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((o, i) => (
                <button
                  key={o.code}
                  ref={i === 0 ? firstButton : undefined}
                  type="button"
                  lang={o.code}
                  onClick={() => choose(o.code)}
                  className={cn(
                    buttonVariants({ size: "lg", variant: i === 0 ? "default" : "secondary" }),
                    "h-auto py-4 flex-col gap-0.5 !text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-lg hover:shadow-cyan-500/20"
                  )}
                  data-testid={`language-gate-${o.code}`}
                >
                  <span className="text-lg font-semibold">{o.label}</span>
                  <span className="text-xs font-light text-white/70">{o.note}</span>
                </button>
              ))}
            </div>

            <p className="mt-6 text-xs text-white/50 font-light">
              <span className="block">Мову можна змінити будь-коли вгорі сторінки</span>
              <span className="block">You can switch it any time at the top of the page</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
