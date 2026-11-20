import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Check, Mail, MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { usePageMeta, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import crewImage from "@assets/ship_owners/crew.webp";
import challengeImage from "@assets/ship_owners/challenge.webp";
import peopleImage from "@assets/ship_owners/people.webp";
import beyondImage from "@assets/ship_owners/beyond.webp";
import readyImage from "@assets/ship_owners/ready.webp";
import partnerImage from "@assets/ship_owners/partner.webp";
import horizonImage from "@assets/ship_owners/horizon.webp";

// "For Ship-Owners", rebranded after the AURA SEA campaign (owner's series of 7 posters, 20.11.2026):
// the page tells the same story frame by frame — need a full crew → the challenge → the right people →
// beyond recruitment → ready to join → one partner → let's talk. The photos are the campaign's own,
// with the lettering removed; the headlines are real text (Russo One), so they read in both languages,
// on a phone and for search engines. The pink–cyan of the logo is used on this page only.

const EASE = [0.22, 1, 0.36, 1] as const;
const WHATSAPP = "380978458147";
const rise: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };
const unveil: Variants = {
  hidden: { opacity: 0, y: 36, clipPath: "inset(0 0 100% 0)" },
  show: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.9, ease: EASE } },
};
const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-80px" } } as const;

/** One poster of the campaign: the photo across the screen and its three-line headline at the bottom. */
function Poster({
  image,
  kicker,
  big,
  sub,
  gradient,
  hero,
  id,
  children,
}: {
  image: string;
  kicker: string;
  big: string;
  sub?: string;
  gradient?: boolean;
  hero?: boolean;
  id?: string;
  children?: React.ReactNode;
}) {
  const Heading = hero ? "h1" : "h2";
  return (
    <section id={id} className={cn("relative flex items-end overflow-hidden", hero ? "min-h-[100svh]" : "min-h-[78svh]")}>
      <motion.img
        src={image}
        alt=""
        aria-hidden="true"
        loading={hero ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover object-top"
        initial={{ scale: 1.1 }}
        {...(hero ? { animate: { scale: 1 } } : { whileInView: { scale: 1 }, viewport: { once: true } })}
        transition={{ duration: 2, ease: EASE }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d12] via-[#0a0d12]/75 to-[#0a0d12]/10" />
      <motion.div
        initial="hidden"
        {...(hero ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-80px" } })}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: hero ? 0.15 : 0 } } }}
        className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-12 sm:pb-20"
      >
        <Heading className="so-display uppercase text-white">
          <motion.span variants={unveil} className="block text-3xl sm:text-5xl leading-none">
            {kicker}
          </motion.span>
          <motion.span
            variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.6, ease: EASE } } }}
            aria-hidden="true"
            className="mt-3 block h-1.5 w-32 sm:w-44 origin-left rounded-full bg-[#19d3f5]"
          />
          <motion.span variants={unveil} className="mt-3 block text-5xl sm:text-8xl lg:text-9xl leading-[0.92] text-balance">
            {/* inline, so the pink → cyan sweep follows the letters of each line, not the whole width */}
            <span className={gradient ? "so-gradient" : "so-pink"}>{big}</span>
          </motion.span>
          {sub && (
            <motion.span variants={unveil} className="mt-4 block text-xl sm:text-3xl leading-tight max-w-4xl">
              {sub}
            </motion.span>
          )}
        </Heading>
        {children}
      </motion.div>
    </section>
  );
}

/** Text that follows a poster: a lead and points, on the near-black of the campaign. */
function Story({ lead, points, columns = 2 }: { lead?: string; points: { title: string; text: string }[]; columns?: 2 | 3 }) {
  return (
    <section className="bg-[#0a0d12] py-16 sm:py-24">
      <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
        {lead && <p className="text-lg sm:text-2xl text-white/85 leading-relaxed max-w-4xl">{lead}</p>}
        <ul className={cn("grid grid-cols-1 gap-x-12 gap-y-8", lead && "mt-12", columns === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")}>
          {points.map((p) => (
            <li key={p.title} className="border-t-2 border-[#e0369c]/80 pt-5">
              <h3 className="font-headline text-xl sm:text-2xl font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-base sm:text-lg text-white/75 leading-relaxed">{p.text}</p>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

export default function ShipOwners() {
  const t = useT();
  usePageMeta(
    "/ship-owners",
    { en: "Crew Management for Ship-Owners", uk: "Управління екіпажами для судновласників" },
    {
      en: "Verified Ukrainian officers and ratings for containers, bulk carriers, tankers, yachts and passenger vessels: selection, documents, travel and contract support. STCW, MLC 2006.",
      uk: "Перевірені українські офіцери й рядовий склад для контейнеровозів, балкерів, танкерів, яхт і пасажирських суден: підбір, документи, поїздки, супровід контракту. STCW, MLC 2006.",
    }
  );

  const whatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t("Hello! We are looking for crew for our vessel.", "Вітаю! Шукаємо екіпаж для нашого судна."))}`;
  const primary = cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg !text-white gap-2");
  const secondary = cn(buttonVariants({ size: "lg", variant: "secondary" }), "h-14 px-8 text-lg !text-white gap-2");

  const steps = [
    { title: t("Requirements", "Вимоги"), text: t("We discuss your fleet needs, vessel types, and specific crew requirements in detail.", "Детально обговорюємо потреби вашого флоту, типи суден і вимоги до екіпажу.") },
    { title: t("Shortlist", "Шорт-лист"), text: t("Our team identifies qualified candidates from our extensive database of 500+ seafarers.", "Наша команда підбирає кваліфікованих кандидатів із бази понад 500 моряків.") },
    { title: t("Vetting", "Перевірка"), text: t("Comprehensive background checks, certification verification, and qualification assessment.", "Ретельна перевірка біографії, сертифікатів і кваліфікації.") },
    { title: t("Deployment", "Направлення на судно"), text: t("Complete documentation preparation, travel arrangements, and vessel joining coordination.", "Повна підготовка документів, організація поїздки та координація посадки на судно.") },
    { title: t("Ongoing Support", "Постійна підтримка"), text: t("24/7 communication, contract management, and crew change coordination throughout the assignment.", "Зв’язок 24/7, супровід контракту та координація змін екіпажу протягом усього рейсу.") },
  ];

  return (
    <div className="relative bg-[#0a0d12] text-white">
      {/* 1 · NEED A FULL CREW */}
      <Poster
        hero
        image={crewImage}
        kicker={t("Need a", "Потрібен")}
        big={t("Full crew", "Повний екіпаж")}
        sub={t("for your vessel or project?", "для вашого судна чи проєкту?")}
        gradient
      >
        <motion.p variants={rise} className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed max-w-2xl" data-testid="heading-ship-owners">
          {t(
            "Comprehensive crew management solutions that reduce your operational complexity while ensuring you have qualified, reliable crew members.",
            "Комплексне управління екіпажами, яке спрощує вашу роботу й забезпечує кваліфікованих і надійних членів екіпажу."
          )}
        </motion.p>
        <motion.div variants={rise} className="mt-8 flex flex-col sm:flex-row gap-3">
          <a href="#contact" className={primary} data-testid="button-hero-contact" data-umami-event="ship-owners-hero-contact">
            {t("Discuss your crew", "Обговорити екіпаж")}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={secondary} data-umami-event="ship-owners-hero-whatsapp">
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            WhatsApp
          </a>
        </motion.div>
      </Poster>

      {/* 2 · THE CHALLENGE */}
      <Poster
        image={challengeImage}
        kicker={t("The", "Наш")}
        big={t("Challenge", "Виклик")}
        sub={t("Building a crew is more than filling vacancies", "Зібрати екіпаж — це більше, ніж закрити вакансії")}
      />
      <Story
        lead={t(
          "Aura Sea Crewing provides crew management for a wide range of vessel types - including Container ships, Bulk carriers, General Cargo, Tankers, Yachts, and Passenger Vessels - handling the entire lifecycle from selection through deployment and ongoing support.",
          "Aura Sea Crewing керує екіпажами для широкого кола суден — контейнеровозів, балкерів, суден генерального вантажу, танкерів, яхт і пасажирських суден — і веде весь цикл: від підбору до посадки й подальшої підтримки."
        )}
        points={[
          { title: t("Crew Selection & Recruitment", "Підбір екіпажу"), text: t("Access to experienced, verified Ukrainian officers and ratings matched to your vessel type and operational requirements.", "Досвідчені й перевірені українські офіцери та рядовий склад, підібрані під тип вашого судна й операційні вимоги.") },
          { title: t("Documentation & Compliance", "Документи та відповідність вимогам"), text: t("Complete handling of certifications, visas, medical examinations, and regulatory requirements.", "Повний супровід сертифікатів, віз, медоглядів і регуляторних вимог.") },
          { title: t("Travel & Logistics", "Поїздки та логістика"), text: t("End-to-end coordination of crew changes, flights, and vessel joining arrangements.", "Повна координація змін екіпажу, перельотів і посадки на судно.") },
          { title: t("Contract Management", "Супровід контрактів"), text: t("Transparent contract administration, payroll processing, and crew welfare monitoring.", "Прозоре адміністрування контрактів, нарахування зарплати й контроль добробуту екіпажу.") },
        ]}
      />

      {/* 3 · THE RIGHT PEOPLE */}
      <Poster
        image={peopleImage}
        kicker={t("The right", "Правильні")}
        big={t("People", "Люди")}
        sub={t("for all positions on board", "на всі посади на борту")}
      />
      <Story
        points={[
          { title: t("International Standards", "Міжнародні стандарти"), text: t("Full compliance with STCW, MLC 2006, ISM Code, and all relevant international maritime regulations.", "Повна відповідність STCW, MLC 2006, Кодексу ISM та всім чинним міжнародним морським вимогам.") },
          { title: t("Rigorous Vetting", "Ретельна перевірка"), text: t("Comprehensive background checks, certificate verification, and competency assessments.", "Перевірка біографії, сертифікатів і компетенцій.") },
          { title: t("Medical Fitness", "Медична придатність"), text: t("Current medical certificates from approved clinics, ensuring crew fitness for sea service.", "Чинні медичні сертифікати від схвалених клінік підтверджують придатність екіпажу до служби в морі.") },
          { title: t("Examination & Interview", "Іспит і співбесіда"), text: t("Our specialists conduct online evaluation, examination and interviewing before send candidates to shipowner company.", "Наші фахівці проводять онлайн-оцінку, іспит і співбесіду, перш ніж направити кандидатів судновласнику.") },
        ]}
      />

      {/* 4 · BEYOND RECRUITMENT */}
      <Poster
        image={beyondImage}
        kicker={t("Beyond", "Більше, ніж")}
        big={t("Recruitment", "Рекрутинг")}
        sub={t("Support doesn’t stop at placement", "Підтримка не закінчується після посадки")}
      />
      <Story
        columns={3}
        points={[
          { title: t("Continuously updated verified database", "Перевірена база, що постійно оновлюється"), text: t("A living pool of qualified seafarers with profiles kept current through structured evaluation and ongoing updates.", "Жива база кваліфікованих моряків з актуальними анкетами завдяки структурованій оцінці та постійному оновленню.") },
          { title: t("Advanced HR automation and analytics", "Автоматизація HR та аналітика"), text: t("Data-driven recruitment workflows, digital tracking, and analytics that shorten time-to-hire and reduce administrative load.", "Підбір на основі даних, цифровий облік і аналітика, що скорочують час найму та адміністративне навантаження.") },
          { title: t("Integrated psychological support for families", "Психологічна підтримка родин"), text: t("Certified partners supporting seafarers and their relatives - an approach that strengthens resilience and stability across the crew lifecycle.", "Сертифіковані партнери підтримують моряків і їхніх рідних — це зміцнює витривалість і стабільність екіпажу на всіх етапах.") },
          { title: t("Fast communication and professional reliability", "Швидкий зв’язок і професійна надійність"), text: t("Responsive coordination, clear updates, and dependable execution from shortlist through joining and beyond.", "Оперативна координація, зрозумілі новини й надійне виконання — від шорт-листа до посадки і далі.") },
          { title: t("Real maritime experience - managed by active seafarers", "Справжній морський досвід — агенцію ведуть діючі моряки"), text: t("An agency run by people who understand life at sea, so requirements, risks, and expectations are interpreted accurately.", "Агенцію ведуть люди, які знають життя в морі, тому вимоги, ризики й очікування ми розуміємо точно.") },
          { title: t("Proven performance - 200+ successful placements", "Підтверджений результат — понад 200 успішних працевлаштувань"), text: t("Over three years of placing Ukrainian seafarers across vessel types, with long-term operator relationships built on results.", "Понад три роки працевлаштовуємо українських моряків на судна різних типів і будуємо довгострокову співпрацю з операторами на основі результатів.") },
        ]}
      />

      {/* 5 · READY TO JOIN — the process */}
      <Poster
        image={readyImage}
        kicker={t("Ready", "Готові")}
        big={t("To join", "До посадки")}
        sub={t("Trained. Verified. Ready to sail.", "Підготовлені. Перевірені. Готові до рейсу.")}
      />
      <section className="bg-[#0a0d12] py-16 sm:py-24">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-white" data-testid="heading-process">
            {t("Process Overview", "Як ми працюємо")}
          </h2>
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-8">
            {steps.map((s) => (
              <li key={s.title} className="border-t-2 border-[#19d3f5]/80 pt-5">
                <h3 className="font-headline text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-base text-white/75 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      {/* 6 · ONE PARTNER */}
      <Poster
        image={partnerImage}
        kicker={t("One crewing partner", "Один крюїнговий партнер")}
        big={t("One reliable solution", "Одне надійне рішення")}
      />

      {/* 7 · LET'S TALK */}
      <section id="contact" className="relative overflow-hidden scroll-mt-20">
        <img src={horizonImage} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-[#0a0d12]/70" />
        <motion.div {...inView} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }} className="relative max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-36">
          <motion.h2 variants={unveil} className="so-display uppercase text-4xl sm:text-7xl leading-[0.95] max-w-4xl text-balance" data-testid="heading-cta-discuss">
            <span className="so-gradient">{t("Let's Discuss Your Crewing Needs", "Обговорімо ваші потреби в екіпажі")}</span>
          </motion.h2>
          <motion.p variants={rise} className="mt-6 text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed">
            {t("Contact us today to learn how AURA SEA can become your reliable crewing partner.", "Зв’яжіться з нами, щоб дізнатися, як AURA SEA може стати вашим надійним крюїнговим партнером.")}
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-col sm:flex-row gap-3">
            <a href="mailto:partner@aurasea.org" className={primary} data-testid="button-contact-ship-owners" data-umami-event="ship-owners-email">
              <Mail className="w-5 h-5" aria-hidden="true" />
              {t("Get in Touch", "Зв’язатися")}
            </a>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={secondary} data-umami-event="ship-owners-whatsapp">
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              WhatsApp
            </a>
          </motion.div>
          <motion.ul variants={rise} className="mt-8 flex flex-col sm:flex-row gap-x-8 gap-y-2 text-base text-white/80">
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#19d3f5]" aria-hidden="true" />
              partner@aurasea.org
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#19d3f5]" aria-hidden="true" />
              +380 97 845 81 47 (WhatsApp, Telegram)
            </li>
            <li>
              <Link href="/about" className="text-[#19d3f5] hover:underline underline-offset-4">
                {t("About AURA SEA", "Про AURA SEA")}
              </Link>
            </li>
          </motion.ul>
        </motion.div>
      </section>
    </div>
  );
}
