import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Check, Heart, Phone, ShieldCheck, Target, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useLang, usePageMeta, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/pages/Privacy";
import heroPhoto from "@assets/stock_images/stormy_sea_about.webp";
import storyPhoto from "@assets/ship_owners/horizon-top.webp";
import workPhoto from "@assets/services/documents.webp";
import familyPhoto from "@assets/ship_owners/beyond.webp";

// "About us", rebuilt 20.11.2026 after the impeccable / taste / motion review: facts first (founded by
// seafarers in Odesa, April 2022; 2000+ seafarers in the base; 200+ placed), how the work is really done
// (what the CRM does: every CV checked by a recruiter, document expiry tracking, matching by rank and
// vessel type, feedback after each contract — no "algorithms" or guarantees), the family support that
// sets the agency apart, values once (not twice), the team and the Ministry list entry for trust,
// and two ways forward at the end. Names and photos of the team: the owner will send them.

const EASE = [0.22, 1, 0.36, 1] as const;
const rise: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };
const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-60px" } } as const;

/** A decorative photo, framed from the top (the campaign photos are retouched lower down). */
function Picture({ src, className }: { src: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      <img src={src} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-cover object-top" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
    </div>
  );
}

export default function About() {
  const t = useT();
  const lang = useLang();
  usePageMeta(
    "/about",
    { en: "About AURA SEA — crewing founded by seafarers", uk: "Про AURA SEA — крюїнг, який заснували моряки" },
    {
      en: "AURA SEA is a Ukrainian crewing agency founded by seafarers in Odesa in 2022: 2,000+ active seafarers in the base, 200+ placements, document tracking and psychological support for seafarers' families.",
      uk: "AURA SEA — українська крюїнгова агенція, яку заснували моряки в Одесі у 2022 році: понад 2000 активних моряків у базі, понад 200 працевлаштувань, супровід документів і психологічна підтримка родин моряків.",
    }
  );

  const stats = [
    { value: "2000+", label: t("active seafarers in our base", "активних моряків у нашій базі") },
    { value: "200+", label: t("seafarers placed on vessels", "моряків працевлаштовано на судна") },
    { value: "2022", label: t("founded in Odesa", "заснована в Одесі") },
  ];

  const vesselTypes = ["Container", "Bulk carrier", "General cargo", "VLCC", "Tanker", "Yacht", "Passenger"];

  const steps = [
    {
      title: t("Every CV is checked by a person", "Кожну анкету перевіряє людина"),
      text: t(
        "CVs come by email, from the website and in person. Our CRM reads them, and a recruiter checks every field before anything is saved.",
        "Анкети надходять поштою, із сайту й особисто. Наша CRM їх розбирає, а рекрутер перевіряє кожне поле, перш ніж щось зберегти."
      ),
    },
    {
      title: t("Documents and their dates", "Документи та їхні строки"),
      text: t(
        "We keep track of diplomas, endorsements, certificates and medicals, and remind the seafarer well before a document expires.",
        "Стежимо за дипломами, підтвердженнями, сертифікатами й медкомісією та заздалегідь нагадуємо моряку, що строк документа закінчується."
      ),
    },
    {
      title: t("Matching to the vacancy", "Підбір під заявку"),
      text: t(
        "For each ship-owner's request we select by rank, vessel type and sea service, and talk to every candidate before proposing them.",
        "Під кожну заявку судновласника підбираємо за посадою, типом судна й стажем і говоримо з кожним кандидатом, перш ніж його запропонувати."
      ),
    },
    {
      title: t("Interview and preparation", "Співбесіда й підготовка"),
      text: t(
        "Competency-based interviews, help with documents and travel, and a smooth joining — we work to MLC 2006 and STCW.",
        "Співбесіди на основі компетенцій, допомога з документами й поїздкою, спокійна посадка на судно — працюємо за вимогами MLC 2006 і STCW."
      ),
    },
    {
      title: t("Feedback after the contract", "Відгук після контракту"),
      text: t(
        "After each contract we record the ship-owner's and master's feedback and take it into account in the next selection.",
        "Після кожного контракту записуємо відгук судновласника й капітана та враховуємо його в наступному підборі."
      ),
    },
  ];

  const values = [
    { title: t("Safety First", "Безпека понад усе"), text: t("The safety and well-being of seafarers come first: we check candidates carefully and follow every requirement.", "Безпека й добробут моряків — на першому місці: ретельно перевіряємо кандидатів і дотримуємося всіх вимог.") },
    { title: t("Transparency", "Прозорість"), text: t("Open, honest communication in everything, from contract terms to day-to-day news.", "Відкрита й чесна комунікація в усьому — від умов контракту до поточних новин.") },
    { title: t("Respect", "Повага"), text: t("We treat every seafarer and partner with dignity, recognising their vital role in world shipping.", "Ставимося до кожного моряка й партнера з гідністю, визнаючи їхню важливу роль у світовому судноплавстві.") },
    { title: t("Development", "Розвиток"), text: t("We support professional growth through training, documents and the next rank.", "Підтримуємо професійне зростання — через навчання, документи й наступну посаду.") },
  ];

  // Names and photos to come from the owner; until then the roles alone
  const team = [
    { icon: Users, role: t("Managing Director", "Керуючий директор"), text: t("Over 4 years in maritime operations and crew management.", "Понад 4 роки в морських операціях і управлінні екіпажами.") },
    { icon: Target, role: t("Operations Director", "Операційний директор"), text: t("Crew deployment, crew changes and work with vessel operators.", "Розстановка екіпажів, заміни та робота з операторами суден.") },
    { icon: Heart, role: t("HR Director", "HR-директор"), text: t("Seafarers' welfare and career development.", "Добробут моряків і їхній кар’єрний розвиток.") },
  ];

  const primary = cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg !text-white gap-2");
  const secondary = cn(buttonVariants({ size: "lg", variant: "secondary" }), "h-14 px-8 text-lg !text-white gap-2");
  const h2 = "font-headline text-3xl sm:text-5xl font-semibold text-white text-balance";

  return (
    <div className="relative bg-[#0b1118] text-white">
      {/* ═══════════ HERO: who we are, in numbers ═══════════ */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <motion.img
          src={heroPhoto}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/75 to-[#0b1118]/25" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
          className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-12 sm:pb-20"
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 32, clipPath: "inset(0 0 100% 0)" },
              show: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.9, ease: EASE } },
            }}
            className="font-headline text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] max-w-4xl text-balance"
            data-testid="heading-about"
          >
            {t("Crewing founded by seafarers", "Крюїнг, який заснували моряки")}
          </motion.h1>
          <motion.p variants={rise} className="mt-5 text-lg sm:text-2xl text-white/85 leading-relaxed max-w-3xl">
            {t(
              "Odesa, since April 2022. Sea experience, a modern CRM and psychological support for seafarers' families.",
              "Одеса, з квітня 2022 року. Морський досвід, сучасна CRM і психологічна підтримка родин моряків."
            )}
          </motion.p>
          <motion.dl variants={rise} className="mt-10 grid grid-cols-3 gap-4 sm:gap-10 max-w-3xl">
            {stats.map((s) => (
              <div key={s.value} className="border-t-2 border-cyan-400/70 pt-3">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-headline text-3xl sm:text-5xl font-bold tabular-nums">{s.value}</dd>
                <dd className="mt-1 text-sm sm:text-base text-white/75 leading-snug">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
          <motion.div variants={rise} className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/apply" className={primary} data-umami-event="about-hero-apply">
              {t("Apply as a seafarer", "Подати анкету моряка")}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link href="/ship-owners" className={secondary} data-umami-event="about-hero-ship-owners">
              {t("For ship-owners", "Судновласникам")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ OUR STORY ═══════════ */}
      <section className="py-20 sm:py-28">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className={h2} data-testid="card-about-company">{t("Founded in Odesa in April 2022", "Заснована в Одесі у квітні 2022 року")}</h2>
            <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed">
              {t(
                "Aura Sea Crewing was founded and is run by experienced seafarers. We know life at sea from the inside, so we understand what a ship-owner needs and what matters to a seafarer and his family.",
                "Aura Sea Crewing заснували й ведуть досвідчені моряки. Ми знаємо життя в морі зсередини, тому розуміємо, чого потребує судновласник і що важливо моряку та його родині."
              )}
            </p>
            <p className="mt-4 text-lg text-white/80 leading-relaxed">
              {t(
                "We select qualified, verified Ukrainian officers and ratings for ships of different types — and over these years have placed more than 200 seafarers, building long-term work with ship-owners.",
                "Ми підбираємо кваліфікованих і перевірених українських офіцерів і рядовий склад для суден різних типів — і за ці роки працевлаштували понад 200 моряків, збудувавши довгострокову співпрацю із судновласниками."
              )}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={t("Vessel types", "Типи суден")}>
              {vesselTypes.map((v) => (
                <li key={v} className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm sm:text-base text-white/85">
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <Picture src={storyPhoto} className="aspect-[5/2] lg:aspect-[2/1]" />
        </motion.div>
      </section>

      {/* ═══════════ HOW WE WORK ═══════════ */}
      <section className="py-20 sm:py-28 bg-white/[0.03] border-y border-white/10">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
            <div>
              <h2 className={h2}>{t("How we work", "Як ми працюємо")}</h2>
              <p className="mt-5 text-lg sm:text-xl text-white/80 leading-relaxed">
                {t(
                  "Our base holds more than 2,000 active seafarers of all ranks. Every profile is kept current: documents, dates, contracts and when the seafarer is ready to join.",
                  "У нашій базі понад 2000 активних моряків усіх посад. Кожна анкета актуальна: документи, строки, контракти й коли моряк готовий до посадки."
                )}
              </p>
              <Picture src={workPhoto} className="mt-8 aspect-[16/10] hidden lg:block" />
            </div>
            <ol className="space-y-8">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-5">
                  <span className="mt-1 grid size-9 flex-shrink-0 place-items-center rounded-full bg-cyan-500/15 text-base font-semibold text-cyan-300 tabular-nums" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-headline text-xl sm:text-2xl font-semibold">{s.title}</span>
                    <span className="mt-1.5 block text-base sm:text-lg text-white/80 leading-relaxed">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ FAMILIES: what sets us apart ═══════════ */}
      <section className="py-20 sm:py-28">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Picture src={familyPhoto} className="aspect-[16/10] order-last lg:order-first" />
          <div>
            <Heart className="w-9 h-9 text-teal-300" aria-hidden="true" />
            <h2 className={cn(h2, "mt-4")}>{t("Support for seafarers and their families", "Підтримка моряків і їхніх родин")}</h2>
            <p className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed">
              {t(
                "Aura Sea Crewing is the first Ukrainian crewing agency with psychological support programmes for seafarers and their families. Calm and emotional balance matter for safe work at sea.",
                "Aura Sea Crewing — перша українська крюїнгова агенція з програмами психологічної підтримки для моряків і їхніх родин. Спокій і емоційна рівновага важливі для безпечної роботи в морі."
              )}
            </p>
            <p className="mt-6 text-base font-semibold">{t("Our certified psychologist partners offer:", "Наші сертифіковані партнери-психологи пропонують:")}</p>
            <ul className="mt-3 space-y-3 text-base sm:text-lg text-white/85">
              {[
                t("Consultations for seafarers' wives, husbands and relatives", "Консультації для дружин, чоловіків і рідних моряків"),
                t("Support for the seafarer's wife: life apart and time together at home", "Підтримку дружини моряка: життя на відстані й час разом удома"),
                t("Stress-resilience sessions for seafarers before and after a contract", "Заняття зі стресостійкості для моряків до і після контракту"),
              ].map((x) => (
                <li key={x} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal-300 mt-1 flex-shrink-0" aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-white/85">
              <Phone className="w-5 h-5 text-teal-300" aria-hidden="true" />
              {t("24/7:", "24/7:")}
              <a href="tel:+380938298652" className="text-teal-300 hover:underline underline-offset-4">+380 93 829 86 52</a>
              <span className="text-white/60">(WhatsApp, Telegram)</span>
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ MISSION AND VALUES (once) ═══════════ */}
      <section className="py-20 sm:py-28 bg-white/[0.03] border-y border-white/10">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className={h2} data-testid="heading-core-values">{t("What we stand for", "Що для нас важливо")}</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
            <p className="text-lg sm:text-xl text-white/85 leading-relaxed">
              <span className="font-semibold text-white">{t("Mission. ", "Місія. ")}</span>
              {t(
                "Reliable crewing through open communication, modern processes and long-term partnership built on trust.",
                "Надійний крюїнг завдяки відкритій комунікації, сучасним процесам і довгостроковій співпраці, побудованій на довірі."
              )}
            </p>
            <p className="text-lg sm:text-xl text-white/85 leading-relaxed">
              <span className="font-semibold text-white">{t("Vision. ", "Бачення. ")}</span>
              {t(
                "To grow into a maritime group: crew management, training, and psychological support for crews and families — with care at the centre.",
                "Вирости в морську групу компаній: управління екіпажами, навчання, психологічна підтримка екіпажів і родин — з турботою в центрі."
              )}
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8">
            {values.map((v) => (
              <li key={v.title} className="border-t-2 border-cyan-400/70 pt-5">
                <h3 className="font-headline text-xl sm:text-2xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-base text-white/80 leading-relaxed">{v.text}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ═══════════ TEAM ═══════════ */}
      <section className="py-20 sm:py-28">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className={h2} data-testid="heading-leadership">{t("Leadership team", "Команда керівників")}</h2>
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.role} className="flex items-start gap-4">
                  <span className="grid size-16 flex-shrink-0 place-items-center rounded-full bg-cyan-500/15" aria-hidden="true">
                    <Icon className="w-7 h-7 text-cyan-300" />
                  </span>
                  <span>
                    <span className="block font-headline text-xl font-semibold">{m.role}</span>
                    <span className="mt-1 block text-base text-white/80 leading-relaxed">{m.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </section>

      {/* ═══════════ TRUST + NEXT STEP ═══════════ */}
      <section className="pb-24 sm:pb-32">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="glass-card rounded-3xl p-7 sm:p-12">
            <p className="flex items-start gap-3 text-base sm:text-lg text-white/85 leading-relaxed max-w-4xl">
              <ShieldCheck className="w-6 h-6 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {/* The same wording as in the Privacy Policy, with the company in front */}
                {t("AURA SEA is ", "AURA SEA ")}
                {COMPANY.intermediaryRegister[lang].replace(/^Included/, "included").replace(/^Включена/, "включена")}.
              </span>
            </p>
            <h2 className="mt-8 font-headline text-3xl sm:text-4xl font-semibold text-balance">{t("Let's work together", "Працюймо разом")}</h2>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/apply" className={primary} data-umami-event="about-close-apply">
                {t("Apply as a seafarer", "Подати анкету моряка")}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link href="/ship-owners" className={secondary} data-umami-event="about-close-ship-owners">
                {t("Request candidates", "Запросити кандидатів")}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
