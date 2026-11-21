import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { AlertCircle, Anchor, ArrowRight, Calendar, Clock, Facebook, Flag, Instagram, Linkedin, Send, Ship, Wallet } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useLang, usePageMeta, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import heroPhoto from "@assets/stock_images/marine_engineer_offi_4366b328.webp";

// "Vacancies" (rebuilt 21.11.2026 after the impeccable / taste / motion review and the owner's decision):
// the open vacancies come straight from the CRM (GET /api/public/vacancies) — rank, vessel type, salary,
// joining date, contract, DWT and flag; never the ship-owner or the vessel's name. Each one leads to the
// application with the rank filled in and the vacancy noted. Telegram is the channel where new ones
// appear first; the other networks are a quiet row.

const CRM_URL = (import.meta.env.VITE_CRM_URL as string | undefined) ?? "https://crm.aurasea.org";
const EASE = [0.22, 1, 0.36, 1] as const;
const rise: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } };

type Named = { code: string; en: string; uk: string };
type Vacancy = {
  id: string;
  rank: Named;
  group: "deck" | "engine" | "catering" | "other";
  vesselType: Named | null;
  dwt: number | null;
  flag: string | null;
  joiningDate: string | null;
  contractMonths: string | null;
  salary: string | null;
};
type Feed = { state: "loading" } | { state: "error" } | { state: "ready"; updatedAt: string; vacancies: Vacancy[] };
type Group = "all" | Vacancy["group"];

const day = (iso: string) => iso.slice(0, 10).split("-").reverse().join(".");

export default function Vacancies() {
  const t = useT();
  const lang = useLang();
  usePageMeta(
    "/vacancies",
    { en: "Vacancies for Seafarers", uk: "Вакансії для моряків" },
    {
      en: "Open vacancies for seafarers from AURA SEA ship-owners: rank, vessel type, salary, joining date and contract. Apply online for a vacancy in a few minutes.",
      uk: "Відкриті вакансії для моряків від судновласників AURA SEA: посада, тип судна, зарплата, дата посадки й контракт. Подайте анкету на вакансію онлайн за кілька хвилин.",
    }
  );

  const [feed, setFeed] = useState<Feed>({ state: "loading" });
  const [group, setGroup] = useState<Group>("all");

  useEffect(() => {
    let alive = true;
    fetch(`${CRM_URL}/api/public/vacancies`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((b: { vacancies: Vacancy[]; updatedAt: string }) => alive && setFeed({ state: "ready", updatedAt: b.updatedAt, vacancies: b.vacancies ?? [] }))
      .catch(() => alive && setFeed({ state: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  const groups: { key: Group; label: string }[] = [
    { key: "all", label: t("All", "Усі") },
    { key: "deck", label: t("Deck", "Палуба") },
    { key: "engine", label: t("Engine", "Машина") },
    { key: "catering", label: t("Galley", "Камбуз") },
    { key: "other", label: t("Other", "Інші") },
  ];
  const vacancies = feed.state === "ready" ? feed.vacancies : [];
  const present = useMemo(() => new Set(vacancies.map((v) => v.group)), [vacancies]);
  const shown = group === "all" ? vacancies : vacancies.filter((v) => v.group === group);

  const primary = cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg !text-white gap-2");
  const secondary = cn(buttonVariants({ size: "lg", variant: "secondary" }), "h-14 px-8 text-lg !text-white gap-2");
  const newTab = <span className="sr-only">{t(" (opens in a new tab)", " (відкриється в новій вкладці)")}</span>;

  const applyHref = (v: Vacancy) => {
    const label = [v.rank[lang], v.vesselType?.[lang], v.joiningDate && `${t("joining", "посадка")} ${day(v.joiningDate)}`].filter(Boolean).join(", ");
    return `/apply?vacancy=${encodeURIComponent(v.id)}&rank=${encodeURIComponent(v.rank.en)}&label=${encodeURIComponent(label)}`;
  };

  return (
    <div className="relative bg-[#0b1118] text-white">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[64svh] flex items-end overflow-hidden">
        <img src={heroPhoto} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/80 to-[#0b1118]/30" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-10 sm:pb-14"
        >
          <motion.h1 variants={rise} className="font-headline text-4xl sm:text-6xl font-bold tracking-tight leading-[1.02]" data-testid="heading-vacancies">
            {t("Vacancies for seafarers", "Вакансії для моряків")}
          </motion.h1>
          <motion.p variants={rise} className="mt-4 text-lg sm:text-2xl text-white/85 leading-relaxed max-w-3xl">
            {t(
              "Open requests from our ship-owners. Choose one and apply in a few minutes — or fill in the application once and we will offer you vacancies of your rank.",
              "Відкриті заявки наших судновласників. Оберіть вакансію й подайте анкету за кілька хвилин — або заповніть анкету один раз, і ми запропонуємо вакансії вашої посади."
            )}
          </motion.p>
          <motion.p variants={rise} className="mt-4 text-base sm:text-lg text-cyan-200 min-h-[1.75rem]" aria-live="polite" data-testid="vacancies-status">
            {feed.state === "ready" &&
              t(
                `${vacancies.length} open ${vacancies.length === 1 ? "vacancy" : "vacancies"} · updated ${day(feed.updatedAt)}`,
                `Відкритих вакансій: ${vacancies.length} · оновлено ${day(feed.updatedAt)}`
              )}
          </motion.p>
          <motion.div variants={rise} className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#list" className={primary}>
              {t("See vacancies", "Дивитися вакансії")}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </a>
            <Link href="/apply" className={secondary} data-umami-event="vacancies-hero-apply">
              {t("Fill in the application", "Заповнити анкету")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ LIST ═══════════ */}
      <section id="list" className="scroll-mt-20 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          {feed.state === "ready" && vacancies.length > 0 && (
            <div role="group" aria-label={t("Department", "Служба")} className="flex flex-wrap gap-2">
              {groups
                .filter((g) => g.key === "all" || present.has(g.key))
                .map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGroup(g.key)}
                    aria-pressed={group === g.key}
                    className={cn(
                      "min-h-[44px] rounded-full border px-5 text-base font-semibold transition-colors duration-200",
                      group === g.key ? "border-cyan-300 bg-cyan-500/20 text-white" : "border-white/20 text-white/80 hover:border-cyan-300/60"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
            </div>
          )}

          {feed.state === "loading" && (
            <ul className="mt-6 space-y-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-28 rounded-2xl bg-white/[0.05] animate-pulse motion-reduce:animate-none" />
              ))}
            </ul>
          )}

          {feed.state === "error" && (
            <p className="mt-2 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-5 text-base sm:text-lg text-white/85" data-testid="vacancies-error">
              <AlertCircle className="w-6 h-6 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {t("Could not load the vacancies right now. New ones are always in our", "Не вдалося завантажити вакансії. Нові завжди є в нашому")}{" "}
                <a href="https://t.me/AURASEA_crew" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline-offset-4 hover:underline">
                  Telegram{newTab}
                </a>
                .
              </span>
            </p>
          )}

          {feed.state === "ready" && (
            <motion.ul key={group} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} className="mt-6 space-y-3" data-testid="vacancies-list">
              {shown.map((v) => (
                <motion.li key={v.id} variants={rise} className="rounded-2xl border border-white/12 bg-white/[0.04] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8" data-testid="vacancy-row">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-headline text-2xl sm:text-3xl font-semibold">{v.rank[lang]}</h2>
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-base sm:text-lg text-white/85">
                      {v.vesselType && (
                        <li className="flex items-center gap-2">
                          <Ship className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                          {v.vesselType[lang]}
                          {v.dwt ? <span className="text-white/60">· {v.dwt.toLocaleString("uk-UA")} DWT</span> : null}
                        </li>
                      )}
                      {!v.vesselType && v.dwt ? <li className="flex items-center gap-2"><Ship className="w-5 h-5 text-cyan-300" aria-hidden="true" />{v.dwt.toLocaleString("uk-UA")} DWT</li> : null}
                      {v.flag && (
                        <li className="flex items-center gap-2">
                          <Flag className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                          {v.flag}
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                        {v.joiningDate ? `${t("Joining", "Посадка")} ${day(v.joiningDate)}` : t("Joining date on request", "Дата посадки — за запитом")}
                      </li>
                      {v.contractMonths && (
                        <li className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                          {t("Contract", "Контракт")} {v.contractMonths} {t("mo.", "міс.")}
                        </li>
                      )}
                      {v.salary && (
                        <li className="flex items-center gap-2 font-semibold text-white">
                          <Wallet className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                          {v.salary}
                        </li>
                      )}
                    </ul>
                  </div>
                  <Link
                    href={applyHref(v)}
                    className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base !text-white gap-2 lg:flex-shrink-0")}
                    data-umami-event="vacancy-apply"
                  >
                    {t("Apply for this vacancy", "Подати анкету")}
                    <span className="sr-only">: {v.rank[lang]}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}

          {feed.state === "ready" && shown.length === 0 && (
            <p className="mt-6 rounded-2xl border border-white/15 bg-white/[0.04] p-5 text-base sm:text-lg text-white/85" data-testid="vacancies-empty">
              {vacancies.length === 0
                ? t("All current vacancies are filled. Fill in the application — we will contact you when there is a vacancy of your rank.", "Зараз усі вакансії закрито. Заповніть анкету — ми зв’яжемося, коли з’явиться вакансія вашої посади.")
                : t("No vacancies in this department right now. Fill in the application — we will contact you when one appears.", "Зараз немає вакансій цієї служби. Заповніть анкету — ми зв’яжемося, коли вона з’явиться.")}{" "}
              <Link href="/apply" className="text-cyan-300 underline-offset-4 hover:underline">
                {t("Fill in the application", "Заповнити анкету")}
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* ═══════════ NO VACANCY OF YOUR RANK? ═══════════ */}
      <section className="py-12 sm:py-16 bg-white/[0.03] border-y border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          <div>
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-balance">{t("Didn't find your rank?", "Не знайшли своєї посади?")}</h2>
            <p className="mt-4 text-lg text-white/80 leading-relaxed">
              {t(
                "Fill in the application once: we keep your profile and offer you vacancies of your rank and fleet as they come in.",
                "Заповніть анкету один раз: ми збережемо її й запропонуємо вакансії вашої посади та флоту, щойно вони надійдуть."
              )}
            </p>
            <Link href="/apply" className={cn(primary, "mt-6")} data-umami-event="vacancies-apply">
              {t("Fill in the application", "Заповнити анкету")}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
          <div>
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-balance">{t("Aiming higher?", "Цілите вище?")}</h2>
            <p className="mt-4 text-lg text-white/80 leading-relaxed">
              {t(
                "Promotion, another fleet, a stronger interview, documents in order — we help you get there faster.",
                "Підвищення, інший флот, сильніша співбесіда, документи в порядку — допомагаємо дійти туди швидше."
              )}
            </p>
            <Link href="/seafarers" className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-lg text-cyan-300 underline-offset-4 hover:underline" data-umami-event="vacancies-services">
              <Anchor className="w-5 h-5" aria-hidden="true" />
              {t("Services for seafarers", "Послуги морякам")}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ CHANNELS ═══════════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
          <a
            href="https://t.me/AURASEA_crew"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-1 items-center gap-5 rounded-2xl border border-white/15 bg-white/[0.04] p-5 sm:p-6 transition-colors duration-200 hover:border-cyan-300/70"
            data-umami-event="vacancies-telegram"
          >
            <Send className="w-10 h-10 flex-shrink-0 text-[#2aa3dd]" aria-hidden="true" />
            <span className="flex-1">
              <span className="block font-headline text-xl sm:text-2xl font-semibold">{t("New vacancies first — in Telegram", "Нові вакансії спершу — у Telegram")}</span>
              <span className="mt-1 block text-base text-white/75">{t("Subscribe to @AURASEA_crew and get them on your phone.", "Підпишіться на @AURASEA_crew і отримуйте їх на телефон.")}</span>
            </span>
            <ArrowRight className="w-5 h-5 text-cyan-300 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            {newTab}
          </a>
          <div>
            <p className="text-base text-white/70">{t("We are also on", "Ми також у")}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {[
                { href: "https://www.instagram.com/_aura_sea/", label: "Instagram", Icon: Instagram },
                { href: "https://www.facebook.com/profile.php?id=61581552804551", label: "Facebook", Icon: Facebook },
                { href: "https://www.linkedin.com/company/110849089", label: "LinkedIn", Icon: Linkedin },
              ].map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 px-4 text-base text-white/85 transition-colors duration-200 hover:border-cyan-300/70"
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {label}
                    {newTab}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
