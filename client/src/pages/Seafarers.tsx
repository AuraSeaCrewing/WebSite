import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { Anchor, ArrowRight, CheckCircle, FileText, Heart, Shield, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { usePageMeta, useT, useLang } from "@/lib/i18n";
import { orderedServices } from "@/lib/services";
import { cn } from "@/lib/utils";
import { ServiceTiles } from "@/pages/Service";
import seafarerCrew from "@assets/stock_images/stormy_sea_3.webp";
import heroPhoto from "@assets/stock_images/seafarer_crew_workin_81b3ed0a.webp";

// "For Seafarers". Its main job (owner's decision 20.11.2026): lead seafarers to the paid services —
// the first screen asks what matters now (promotion, fleet, interview, documents) and the full service
// tiles follow right under it. Looking for a job is the second path: the application and vacancies.

const EASE = [0.22, 1, 0.36, 1] as const;
const rise: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };
const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-60px" } } as const;

export default function Seafarers() {
  const t = useT();
  const lang = useLang();
  usePageMeta(
    "/seafarers",
    { en: "Jobs at Sea for Seafarers", uk: "Робота в морі для моряків" },
    {
      en: "Work on containers, bulk carriers, tankers, yachts and passenger vessels with AURA SEA: fair contracts, timely salary, career growth and psychological support for families.",
      uk: "Робота на контейнеровозах, балкерах, танкерах, яхтах і пасажирських суднах з AURA SEA: чесні контракти, вчасна зарплата, кар’єрне зростання та психологічна підтримка родин.",
    }
  );

  const goals = orderedServices().filter((s) => s.slug !== "crewing-start");

  const offers = [
    {
      title: t("Fair Contracts", "Чесні контракти"),
      desc: t("Clear contract terms with no hidden clauses. We ensure you understand every detail before signing.", "Зрозумілі умови без прихованих пунктів. Ми подбаємо, щоб ви розуміли кожну деталь до підписання."),
      testId: "card-offer-fair-contracts",
    },
    {
      title: t("Timely Payment", "Вчасні виплати"),
      desc: t("Reliable, on-time salary payments every month. Your financial security is our priority.", "Надійна й вчасна зарплата щомісяця. Ваша фінансова безпека — наш пріоритет."),
      testId: "card-offer-timely-payment",
    },
    {
      title: t("Safe & Reputable Fleets", "Безпечні й надійні флоти"),
      desc: t("We partner only with established ship-owners who maintain high safety and operational standards.", "Ми співпрацюємо лише з перевіреними судновласниками, які дотримуються високих стандартів безпеки й експлуатації."),
      testId: "card-offer-safe-fleets",
    },
    {
      title: t("Long-Term Cooperation", "Довгострокова співпраця"),
      desc: t("Opportunities for repeated contracts and career continuity with the same fleet.", "Повторні контракти та стабільна кар’єра в одному флоті."),
      testId: "card-offer-long-term",
    },
  ];

  const careers = [
    {
      title: t("Career Progression", "Кар’єрне зростання"),
      lead: t("We support your professional advancement through:", "Ми підтримуємо ваше професійне зростання:"),
      items: [
        t("Opportunities to advance from junior to senior positions", "Можливість рости від молодших до старших посад"),
        t("Regular performance assessments and career guidance", "Регулярна оцінка роботи й кар’єрні поради"),
        t("Priority consideration for matching openings", "Пріоритет при розгляді на відповідні вакансії"),
      ],
      link: { href: "/services/promotion", label: t("Personal preparation for promotion", "Особиста підготовка до підвищення") },
    },
    {
      title: t("Training & Development", "Навчання та розвиток"),
      lead: t("Invest in your skills with our support:", "Розвивайте навички з нашою підтримкою:"),
      items: [
        t("Information about training courses and certifications", "Інформація про курси й сертифікацію"),
        t("Guidance on required qualifications for advancement", "Поради щодо кваліфікації, потрібної для підвищення"),
        t("Connections to approved training institutions", "Зв’язок зі схваленими навчальними центрами"),
      ],
      link: { href: "/services/documents", label: t("We take care of your documents", "Оформимо ваші документи") },
    },
  ];

  const steps = [
    {
      title: t("Register Interest", "Подайте анкету"),
      description: t("Check our Hot Vacancies at Instagram page and Telegram Group Chanel for current openings and submit your application through our online form.", "Перегляньте гарячі вакансії в нашому Instagram і Telegram-каналі та подайте анкету через онлайн-форму."),
      icon: FileText,
    },
    {
      title: t("Interview & Assessment", "Співбесіда та оцінка"),
      description: t("We'll review your qualifications and conduct an interview to understand your experience and career goals.", "Ми переглянемо вашу кваліфікацію й проведемо співбесіду, щоб зрозуміти ваш досвід і кар’єрні цілі."),
      icon: Users,
      link: { href: "/services/interview", label: t("Want to prepare? Interview preparation", "Хочете підготуватися? Підготовка до співбесіди") },
    },
    {
      title: t("Documentation", "Документи"),
      description: t("Submit required certificates, medical examinations, and complete necessary paperwork with our support.", "Надайте потрібні сертифікати й медогляди та оформіть документи з нашою допомогою."),
      icon: Shield,
      link: { href: "/services/documents", label: t("Something expiring? Maritime documents", "Щось закінчується? Морські документи") },
    },
    {
      title: t("Joining Vessel", "Посадка на судно"),
      description: t("We coordinate all travel arrangements, briefings, and ensure smooth joining process to your assigned vessel.", "Ми організуємо поїздку, інструктажі та подбаємо про спокійну посадку на ваше судно."),
      icon: Anchor,
    },
  ];

  const serviceLink = "inline-flex items-center gap-1.5 text-base font-medium text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline";

  return (
    <div className="min-h-screen pb-16 relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: `url(${seafarerCrew})` }} />
      <div className="fixed inset-0 bg-[#0b1118]/70 z-0" />

      {/* ═══════════ HERO: what matters to you now ═══════════ */}
      <section className="relative z-10 min-h-[100svh] flex items-end overflow-hidden" data-testid="seafarers-hero">
        <motion.img
          src={heroPhoto}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/80 to-[#0b1118]/30" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
          className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-12 sm:pb-20"
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 32, clipPath: "inset(0 0 100% 0)" },
              show: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.9, ease: EASE } },
            }}
            className="font-headline text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-white max-w-4xl text-balance"
            data-testid="heading-seafarers"
          >
            {t("Your next contract\u00a0— a step higher", "Ваш наступний контракт\u00a0— на крок вище")}
          </motion.h1>
          <motion.p variants={rise} className="mt-5 text-lg sm:text-2xl text-white/85 leading-relaxed max-w-2xl">
            {t(
              "Promotion, a new fleet, a confident interview and documents in order. From seafarers to seafarers.",
              "Підвищення, новий флот, впевнена співбесіда й документи в порядку. Від моряків — морякам."
            )}
          </motion.p>

          <motion.p variants={rise} className="mt-9 text-base sm:text-lg font-semibold text-cyan-200">
            {t("What matters to you now?", "Що для вас зараз головне?")}
          </motion.p>
          <motion.ul variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 max-w-5xl">
            {goals.map((s) => {
              const Icon = s.icon;
              return (
                <motion.li key={s.slug} variants={rise}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group flex h-full min-h-[64px] items-center gap-3 rounded-2xl border border-white/20 bg-[#0b1118]/60 px-4 py-3 text-left backdrop-blur-md transition-colors duration-200 hover:border-cyan-300 hover:bg-cyan-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                    data-testid={`goal-${s.slug}`}
                    data-umami-event={`seafarers-goal-${s.slug}`}
                  >
                    <Icon className="w-6 h-6 text-cyan-300 flex-shrink-0" aria-hidden="true" />
                    <span className="flex-1 text-base sm:text-lg font-semibold leading-tight text-white">{s.goal[lang]}</span>
                    <ArrowRight className="hidden sm:block w-5 h-5 text-cyan-300 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>

          <motion.div variants={rise} className="mt-6 flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-3 text-base sm:text-lg">
            <Link href="/apply" className={serviceLink} data-umami-event="apply-button-seafarers-hero">
              {t("Looking for a job? Apply", "Шукаєте роботу? Подати анкету")}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link href="/services/crewing-start" className={serviceLink} data-umami-event="seafarers-goal-crewing-start">
              {t("Open your own crewing agency", "Відкрити свій крюїнг")}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <div className="relative z-10">
        {/* ═══════════ SERVICES ═══════════ */}
        <section id="services" className="py-20 sm:py-24 scroll-mt-20" data-testid="section-services">
          <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="font-headline text-3xl sm:text-5xl font-semibold text-white text-balance max-w-3xl">
              {t("Grow with AURA SEA", "Зростайте разом з AURA SEA")}
            </h2>
            <p className="mt-4 mb-10 text-lg sm:text-xl text-white/80 max-w-2xl">
              {t(
                "We prepare, sort out documents and recommend you to ship-owners: we work with them every day.",
                "Готуємо, оформлюємо документи й рекомендуємо судновласникам: ми працюємо з ними щодня."
              )}
            </p>
            <ServiceTiles />
          </motion.div>
        </section>

        {/* ═══════════ WHAT WE OFFER ═══════════ */}
        <section className="py-20 sm:py-24">
          <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-white" data-testid="heading-what-we-offer-you">
              {t("What We Offer You", "Що ми вам пропонуємо")}
            </h2>
            <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {offers.map((o) => (
                <li key={o.testId} className="border-t-2 border-cyan-400/70 pt-5" data-testid={o.testId}>
                  <h3 className="font-headline text-xl sm:text-2xl font-semibold text-white">{o.title}</h3>
                  <p className="mt-2 text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">{o.desc}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* ═══════════ WELLBEING & FAMILY SUPPORT ═══════════ */}
        <section className="py-20 sm:py-24">
          <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="glass-card rounded-3xl p-6 sm:p-10 lg:p-12 border-teal-500/20 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14">
              <div>
                <Heart className="w-8 h-8 text-teal-300" aria-hidden="true" />
                <h2 className="mt-4 font-headline text-3xl sm:text-4xl font-semibold text-white" data-testid="heading-seafarers-wellbeing">
                  {t("Wellbeing & family support", "Добробут і підтримка родини")}
                </h2>
                <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed">
                  {t(
                    "Aura Sea Crewing is the first Ukrainian crewing agency integrating psychological support for seafarers and their families. Mental stability and emotional balance matter for safe, effective work at sea - and we build that into how we work with you.",
                    "Aura Sea Crewing — перша українська крюїнгова агенція, що впроваджує психологічну підтримку для моряків і їхніх родин. Психологічна стабільність і емоційна рівновага важливі для безпечної та ефективної роботи в морі — і ми враховуємо це в усій співпраці з вами."
                  )}
                </p>
              </div>
              <div>
                <p className="text-base font-semibold text-white">{t("Through certified psychological partners we offer:", "Разом із сертифікованими партнерами-психологами ми пропонуємо:")}</p>
                <ul className="mt-4 space-y-3 text-base text-white/80 leading-relaxed">
                  {[
                    t("Support and consultations for seafarers' spouses and relatives", "Підтримка й консультації для дружин, чоловіків і родичів моряків"),
                    t("Stress-resilience sessions for seafarers before and after contracts", "Заняття зі стресостійкості для моряків до і після контракту"),
                    t("Continuous mental health awareness integrated into our HR process", "Постійна увага до психічного здоров’я як частина нашого HR-процесу"),
                    t("Supporting the mental health of a sailor's wife and improving the quality of long-distance relationships and a comfortable stay together", "Підтримка психічного здоров’я дружини моряка, покращення стосунків на відстані та комфортного часу разом"),
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════ CAREER PATH ═══════════ */}
        <section className="py-20 sm:py-24">
          <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-white" data-testid="heading-career-path">
              {t("Your Career Path with AURA SEA", "Ваша кар’єра з AURA SEA")}
            </h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {careers.map((c) => (
                <div key={c.title} className="border-t-2 border-cyan-400/70 pt-5">
                  <h3 className="font-headline text-xl sm:text-2xl font-semibold text-white">{c.title}</h3>
                  <p className="mt-2 text-base sm:text-lg text-white/80">{c.lead}</p>
                  <ul className="mt-4 space-y-2.5 text-base text-white/80">
                    {c.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-cyan-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={c.link.href} className={cn(serviceLink, "mt-5")} data-umami-event={`seafarers-career-${c.link.href.split("/").pop()}`}>
                    {c.link.label}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════════ PROCESS ═══════════ */}
        <section className="py-20 sm:py-24">
          <motion.div {...inView} variants={rise} className="max-w-4xl mx-auto px-5 sm:px-8">
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-white" data-testid="heading-how-process-works">
              {t("How the Process Works", "Як усе відбувається")}
            </h2>
            <ol className="timeline-line mt-10 space-y-6">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="flex gap-5">
                    <span className="flex-shrink-0 w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center z-10">
                      <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </span>
                    <div className="flex-1 glass-card rounded-xl p-5">
                      <h3 className="font-headline text-lg sm:text-xl font-semibold text-white">{step.title}</h3>
                      <p className="mt-1.5 text-base text-white/80 leading-relaxed">{step.description}</p>
                      {step.link && (
                        <Link href={step.link.href} className={cn(serviceLink, "mt-3")} data-umami-event={`seafarers-step-${step.link.href.split("/").pop()}`}>
                          {step.link.label}
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-10 text-base text-white/80 leading-relaxed">
              <span className="font-semibold text-white">{t("Important Note", "Важливо")}: </span>
              {t("Active vacancies are regularly posted on our Socials", "Актуальні вакансії ми регулярно публікуємо в соцмережах")} (<a href="https://t.me/AURASEA_crew" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">Telegram</a>, <a href="https://www.instagram.com/_aura_sea/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">Instagram</a>, <a href="https://www.linkedin.com/company/110849089" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">LinkedIn</a>). {t("When you find a matching position,", "Знайшли відповідну посаду —")} <Link href="/apply" className="text-cyan-300 hover:underline">{t("submit your application", "подайте анкету")}</Link>{t(" and our team will review your profile.", ", і наша команда розгляне вашу кандидатуру.")}
            </p>
          </motion.div>
        </section>

        {/* ═══════════ CLOSE ═══════════ */}
        <section className="py-16 sm:py-20">
          <motion.div {...inView} variants={rise} className="max-w-4xl mx-auto px-5 sm:px-8">
            <div className="glass-premium rounded-3xl p-7 sm:p-12 text-center">
              <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-white text-balance" data-testid="heading-cta-check-vacancies">
                {t("Ready to Start Your Journey?", "Готові вирушити в рейс?")}
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                {t("Fill in our application form, check current vacancies or get in touch to learn more about opportunities with AURA SEA.", "Заповніть анкету, перегляньте актуальні вакансії або зв’яжіться з нами, щоб дізнатися більше про можливості з AURA SEA.")}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/apply"
                  className={cn(buttonVariants({ size: "lg" }), "inline-flex px-8 h-14 text-lg !text-white")}
                  data-testid="button-apply-seafarers"
                  data-umami-event="apply-button-seafarers"
                >
                  {t("Apply Now", "Подати анкету")}
                </Link>
                <Link
                  href="/vacancies"
                  className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "inline-flex px-8 h-14 text-lg !text-white")}
                  data-testid="button-view-vacancies"
                >
                  {t("View Vacancies", "Вакансії")}
                </Link>
              </div>
              <p className="mt-8 text-base text-white/80">
                {t("Want to grow faster?", "Хочете зростати швидше?")}{" "}
                {goals.map((s, i) => (
                  <span key={s.slug}>
                    {i > 0 && " · "}
                    <Link href={`/services/${s.slug}`} className="text-cyan-300 hover:underline underline-offset-4" data-umami-event={`seafarers-close-${s.slug}`}>
                      {s.name[lang]}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
