import { Link } from "wouter";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePageMeta, useT } from "@/lib/i18n";
import heroPhoto from "@assets/stock_images/Gemini_Generated_Image_x18mj0x18mj0x18m.webp";
import crewPhoto from "@assets/stock_images/marine_engineer_offi_4366b328.webp";
import portPhoto from "@assets/stock_images/maritime_shipping_po_c83c1900.webp";

// Home: the first screen speaks to the seafarer (the visitor who applies), the ship-owner has the second action.
// Sections alternate picture and text instead of rows of icon cards; text is set large enough to read on a phone.

const EASE = [0.22, 1, 0.36, 1] as const;

/** Parts of a block appear one after another as it scrolls into view: heading, text, list, picture. */
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const rise: Variants = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };
const reveal: Variants = {
  hidden: { opacity: 0, clipPath: "inset(12% 12% 12% 12% round 28px)" },
  show: { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 28px)", transition: { duration: 1.1, ease: EASE } },
};

const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-80px" } } as const;

function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <motion.div variants={reveal} className={cn("relative overflow-hidden rounded-[28px]", className)}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </motion.div>
  );
}

/**
 * A ship under way as the background of the care statement: a short muted loop on computers; phones,
 * data-saver mode and visitors who turned animations off get its still frame.
 */
function AmbientVideo() {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setPlay(window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)").matches && !conn?.saveData);
  }, []);
  return play ? (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src="/videos/ship-aerial.mp4"
      poster="/videos/ship-aerial-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  ) : (
    <img src="/videos/ship-aerial-poster.jpg" alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
  );
}

/** One benefit as a line of large text with its explanation — no icon tiles. */
function Point({ title, text }: { title: string; text: string }) {
  return (
    <motion.li variants={rise} className="py-4 first:pt-0">
      <h3 className="font-headline text-xl sm:text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-base sm:text-lg text-white/80 leading-relaxed">{text}</p>
    </motion.li>
  );
}

export default function Home() {
  const t = useT();
  usePageMeta(
    "/",
    { en: "Maritime Crewing Agency — From Seafarers to Seafarers", uk: "Крюїнгова агенція — від моряків морякам" },
    {
      en: "Ukrainian crew management for containers, bulk carriers, tankers & yachts. Modern HR system, psychological support for seafarers & families. Crewing with Care.",
      uk: "Український крюїнг для контейнеровозів, балкерів, танкерів і яхт. Сучасна HR-система, психологічна підтримка моряків і їхніх родин. Крюїнг з турботою.",
    }
  );

  const primary = cn(
    buttonVariants({ size: "lg" }),
    "h-14 px-8 text-lg !text-white inline-flex items-center justify-center gap-2 transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]"
  );
  const secondary = cn(
    buttonVariants({ size: "lg", variant: "secondary" }),
    "h-14 px-8 text-lg !text-white inline-flex items-center justify-center transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]"
  );

  return (
    <div className="relative bg-[#0b1118]">
      {/* ═══════════ HERO: for the seafarer first ═══════════ */}
      <section className="relative min-h-[92svh] flex items-end sm:items-center overflow-hidden">
        <motion.img
          src={heroPhoto}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        />
        {/* Neutral scrim so the headline reads over the ship */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#0b1118]/95 via-[#0b1118]/55 to-[#0b1118]/10" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
          className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 pt-32 pb-16 sm:py-32"
        >
          <motion.h1
            variants={rise}
            className="font-headline text-5xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[0.95] text-white max-w-4xl"
            data-testid="text-hero-tagline"
          >
            {t("Crewing with Care", "Крюїнг з турботою")}
          </motion.h1>
          <motion.p variants={rise} className="mt-4 font-headline text-2xl sm:text-4xl font-semibold uppercase text-cyan-300">
            {t("From seafarers to seafarers", "Від моряків — морякам")}
          </motion.p>
          <motion.p variants={rise} className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl" data-testid="text-hero-subtitle">
            {t(
              "Ukrainian crew management for container vessels, bulk carriers, tankers, passenger ships and yachts worldwide, with a modern HR system and psychological support for seafarers’ families.",
              "Український крюїнг для контейнеровозів, балкерів, танкерів, пасажирських суден і яхт по всьому світу — із сучасною HR-системою та психологічною підтримкою родин моряків."
            )}
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/apply" className={primary} data-testid="link-hero-apply" data-umami-event="apply-button-home-hero">
              {t("Apply as a seafarer", "Подати анкету моряка")}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link href="/ship-owners" className={secondary} data-testid="link-hero-ship-owners">
              {t("For ship-owners", "Судновласникам")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ FOR SEAFARERS: picture + reasons ═══════════ */}
      <section className="relative py-24 sm:py-40">
        <motion.div {...inView} variants={group} className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <Photo
            src={crewPhoto}
            alt={t("Crew members in orange coveralls at work on deck", "Члени екіпажу в помаранчевих комбінезонах працюють на палубі")}
            className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]"
          />
          <div>
            <motion.h2 variants={rise} className="font-headline text-4xl sm:text-5xl font-bold text-white leading-tight text-balance" data-testid="heading-seafarers-why">
              {t("For seafarers: why AURA SEA", "Морякам: чому AURA SEA")}
            </motion.h2>
            <motion.p variants={rise} className="mt-4 text-lg sm:text-xl text-white/85 leading-relaxed">
              {t("Transparent contracts, timely payments and real career growth.", "Прозорі контракти, вчасні виплати й реальне кар’єрне зростання.")}
            </motion.p>
            <motion.ul variants={group} className="mt-8">
              <Point
                title={t("Fair contracts", "Чесні контракти")}
                text={t(
                  "Clear terms with no hidden clauses. We make sure you understand every detail before signing.",
                  "Зрозумілі умови без прихованих пунктів. Ми подбаємо, щоб ви розуміли кожну деталь до підписання."
                )}
              />
              <Point
                title={t("Timely payment", "Вчасні виплати")}
                text={t("Reliable, on-time salary. Your financial security is our priority.", "Надійна й вчасна виплата зарплати. Ваша фінансова безпека — наш пріоритет.")}
              />
              <Point
                title={t("Career and training", "Кар’єра та навчання")}
                text={t(
                  "Training and the next rank: we help you get the documents and courses a promotion needs.",
                  "Навчання й наступна посада: допомагаємо з документами та курсами, потрібними для підвищення."
                )}
              />
              <Point
                title={t("Support for you and your family", "Підтримка вас і вашої родини")}
                text={t(
                  "When families are supported, seafarers work better, come home healthier, and a long career at sea becomes real.",
                  "Коли родина має підтримку, моряк краще працює, повертається додому здоровішим, а довга кар’єра в морі стає реальною."
                )}
              />
            </motion.ul>
            <motion.div variants={rise} className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link href="/apply" className={primary} data-testid="button-apply-home" data-umami-event="apply-button-home-seafarers">
                {t("Apply now", "Подати анкету")}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link href="/seafarers" className="text-lg text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline min-h-[44px] inline-flex items-center" data-testid="button-learn-more-seafarers">
                {t("More about working with us", "Детальніше про роботу з нами")}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ CARE: statement over the open sea ═══════════ */}
      <section className="relative overflow-hidden">
        <AmbientVideo />
        <div className="absolute inset-0 bg-[#0b1118]/70" />
        <motion.div {...inView} variants={group} className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-36">
          <motion.h2 variants={rise} className="font-headline text-4xl sm:text-6xl font-bold text-white max-w-4xl leading-tight text-balance" data-testid="heading-fresh-vision">
            {t("Sea experience and real care", "Морський досвід і справжня турбота")}
          </motion.h2>
          <motion.p variants={rise} className="mt-5 text-lg sm:text-xl text-white/85 max-w-3xl leading-relaxed">
            {t(
              "Combining strong maritime experience with a modern recruitment system, transparent communication and care for seafarers’ wellbeing at every stage.",
              "Поєднуємо міцний морський досвід із сучасною системою підбору, прозорою комунікацією та турботою про добробут моряка на кожному етапі."
            )}
          </motion.p>
          <motion.div variants={group} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                title: t("Psychological care", "Психологічна підтримка"),
                text: t(
                  "Support for the seafarer and their spouse keeps emotional stability, trust and resilience through long contracts.",
                  "Підтримка моряка та його дружини чи чоловіка допомагає зберегти емоційну стабільність, довіру й витривалість під час довгих контрактів."
                ),
              },
              {
                title: t("Checked at every stage", "Перевірка на кожному етапі"),
                text: t(
                  "Every candidate goes through our selection stages under the eye of our specialists.",
                  "Кожен кандидат проходить нашу систему відбору з перевіреними етапами під контролем наших фахівців."
                ),
              },
              {
                title: t("Long-term partnerships", "Довгострокова співпраця"),
                text: t(
                  "Lasting relationships built on trust, reliability and mutual growth — with ship-owners and seafarers alike.",
                  "Тривалі відносини на довірі, надійності та спільному зростанні — і з судновласниками, і з моряками."
                ),
              },
            ].map((x) => (
              <motion.div key={x.title} variants={rise} className="border-t-2 border-cyan-400/70 pt-5">
                <h3 className="font-headline text-2xl font-semibold text-white">{x.title}</h3>
                <p className="mt-2 text-base sm:text-lg text-white/80 leading-relaxed">{x.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ FOR SHIP-OWNERS: text + picture ═══════════ */}
      <section className="relative py-24 sm:py-40">
        <motion.div {...inView} variants={group} className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <motion.h2 variants={rise} className="font-headline text-4xl sm:text-5xl font-bold text-white leading-tight text-balance" data-testid="heading-ship-owners-benefits">
              {t("For ship-owners", "Судновласникам")}
            </motion.h2>
            <motion.p variants={rise} className="mt-4 text-lg sm:text-xl text-white/85 leading-relaxed">
              {t("Your reliable partner for comprehensive crew management.", "Надійний партнер у комплексному управлінні екіпажами.")}
            </motion.p>
            <motion.ul variants={group} className="mt-8">
              <Point
                title={t("Compliance and certification", "Відповідність стандартам і сертифікація")}
                text={t(
                  "Full compliance with international maritime standards, thorough vetting, medical checks and certificate management.",
                  "Повна відповідність міжнародним морським стандартам, ретельна перевірка кандидатів, медогляди та супровід сертифікації."
                )}
              />
              <Point
                title={t("Experienced crew database", "База досвідчених моряків")}
                text={t(
                  "500+ verified professionals across ranks and vessel types — containers, bulk carriers, tankers and more.",
                  "Понад 500 перевірених фахівців усіх посад і типів суден — контейнеровози, балкери, танкери та інші."
                )}
              />
            </motion.ul>
            <motion.div variants={rise} className="mt-8">
              <Link href="/ship-owners" className={secondary} data-testid="button-learn-more-owners">
                {t("Our services for ship-owners", "Наші послуги судновласникам")}
              </Link>
            </motion.div>
          </div>
          <Photo
            src={portPhoto}
            alt={t("Container terminal at night with ships under the cranes", "Контейнерний термінал уночі, судна під кранами")}
            className="order-1 lg:order-2 aspect-[4/3] lg:aspect-[4/5]"
          />
        </motion.div>
      </section>

      {/* ═══════════ CLOSE: both audiences, two clear actions ═══════════ */}
      <section className="relative pb-24 sm:pb-40">
        <motion.div {...inView} variants={group} className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="glass-premium rounded-[28px] p-8 sm:p-14 lg:p-16 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-16 items-center">
            <div>
              <motion.h2 variants={rise} className="font-headline text-3xl sm:text-5xl font-bold text-white leading-tight text-balance" data-testid="heading-cta">
                {t("Ready to work with AURA SEA?", "Готові працювати з AURA SEA?")}
              </motion.h2>
              <motion.p variants={rise} className="mt-4 text-lg sm:text-xl text-white/85 leading-relaxed">
                {t(
                  "Seafarers — send your application in about 10 minutes. Ship-owners — tell us what crew you need.",
                  "Морякам — анкета за 10 хвилин. Судновласникам — розкажіть, який екіпаж вам потрібен."
                )}
              </motion.p>
            </div>
            <motion.div variants={rise} className="flex flex-col gap-3">
              <Link href="/apply" className={primary} data-umami-event="apply-button-home-close">
                {t("Apply as a seafarer", "Подати анкету моряка")}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link href="/contact" className={secondary} data-testid="button-contact-aura-sea">
                {t("Contact us", "Зв’язатися з нами")}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
