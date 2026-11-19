import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Heart,
  TrendingUp,
  Users,
  Target,
  Award,
  CheckCircle,
  Database,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
const MotionCard = motion.create(Card);
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import aboutHero from "@assets/stock_images/stormy_sea_about.webp";
import { usePageMeta, useT } from "@/lib/i18n";
import heroPhoto from "@assets/stock_images/venti-views-1cqIcrWFQBI-unsplash.webp";

export default function About() {
  useScrollAnimation();
  const t = useT();
  usePageMeta(
    "/about",
    { en: "About Us", uk: "Про нас" },
    {
      en: "AURA SEA is a Ukrainian crewing agency founded by seafarers in Odesa: 500+ verified seafarers, modern HR system and psychological support for crews and families.",
      uk: "AURA SEA — українська крюїнгова агенція, яку заснували моряки в Одесі: понад 500 перевірених моряків, сучасна HR-система та психологічна підтримка екіпажів і родин.",
    }
  );

  const missionVisionValues = [
    {
      icon: Target,
      title: t("Mission", "Місія"),
      desc: t("To provide reliable crewing solutions through transparent communication, modern processes, and long-term partnerships built on trust and excellence.", "Надавати надійні крюїнгові рішення завдяки прозорій комунікації, сучасним процесам і довгостроковій співпраці, побудованій на довірі та якості."),
      iconBg: "bg-cyan-500/10",
      iconClass: "text-cyan-400",
    },
    {
      icon: TrendingUp,
      title: t("Vision", "Бачення"),
      desc: t("To become a leading maritime holding company, continuously innovating in crew management, training, psychology crew and family wellnes and related services while maintaining our commitment to care.", "Стати провідним морським холдингом, який постійно вдосконалює управління екіпажами, навчання, психологічну підтримку моряків і їхніх родин та суміжні послуги, зберігаючи відданість турботі."),
      iconBg: "bg-teal-500/10",
      iconClass: "text-teal-400",
    },
    {
      icon: Award,
      title: t("Values", "Цінності"),
      desc: t("Safety, transparency, respect, reliability, and professional development guide every decision we make.", "Безпека, прозорість, повага, надійність і професійний розвиток визначають кожне наше рішення."),
      iconBg: "bg-blue-500/10",
      iconClass: "text-blue-400",
    },
  ] as const;

  const coreValues = [
    {
      icon: Shield,
      title: t("Safety First", "Безпека понад усе"),
      desc: t("Ensuring the safety and well-being of seafarers is our top priority, with rigorous vetting and compliance procedures.", "Безпека й добробут моряків — наш головний пріоритет, тому ми ретельно перевіряємо кандидатів і дотримуємося всіх вимог."),
      iconBg: "bg-cyan-500/10",
      iconClass: "text-cyan-400",
    },
    {
      icon: Target,
      title: t("Transparency", "Прозорість"),
      desc: t("Open, honest communication in all our dealings, from contract terms to operational updates.", "Відкрита й чесна комунікація в усьому — від умов контракту до поточних новин."),
      iconBg: "bg-teal-500/10",
      iconClass: "text-teal-400",
    },
    {
      icon: Heart,
      title: t("Respect", "Повага"),
      desc: t("Treating every seafarer and partner with dignity, recognizing the vital role they play in global maritime trade.", "Ставимося до кожного моряка й партнера з гідністю, визнаючи їхню важливу роль у світовій морській торгівлі."),
      iconBg: "bg-blue-500/10",
      iconClass: "text-blue-400",
    },
    {
      icon: TrendingUp,
      title: t("Development", "Розвиток"),
      desc: t("Supporting continuous professional growth through training opportunities and career advancement.", "Підтримуємо постійне професійне зростання через навчання та кар’єрне просування."),
      iconBg: "bg-cyan-500/10",
      iconClass: "text-cyan-400",
    },
  ] as const;

  const leadership = [
    {
      icon: Users,
      title: t("Managing Director", "Керуючий директор"),
      badge: t("Leadership", "Керівництво"),
      desc: t("4 years in maritime operations and crew management.", "4 роки в морських операціях і управлінні екіпажами."),
      gradient: "from-cyan-500 to-teal-600",
    },
    {
      icon: Target,
      title: t("Operations Director", "Операційний директор"),
      badge: t("Operations", "Операції"),
      desc: t("Expert in crew deployment and vessel operations management.", "Експерт із розстановки екіпажів і управління суднами."),
      gradient: "from-teal-500 to-blue-600",
    },
    {
      icon: Heart,
      title: t("HR Director", "HR-директор"),
      badge: t("Human Resources", "Персонал"),
      desc: t("Dedicated to seafarer welfare and career development.", "Опікується добробутом моряків і їхнім кар’єрним розвитком."),
      gradient: "from-blue-500 to-cyan-600",
    },
  ] as const;

  return (
    <div className="min-h-screen pb-16 relative">
      {/* Fixed background for the whole page */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${aboutHero})` }}
      />
      <div className="fixed inset-0 bg-black/40 z-0" />

      {/* ═══════════ HERO ═══════════ */}
      <section className="py-24 pt-32 relative flex items-center z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-animate">
          <div className="relative rounded-3xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-h-[400px] flex items-center">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroPhoto})` }}
            />
            {/* Elegant Gradient Overlays for Text Legibility and Aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20 backdrop-blur-none" />
            <div className="absolute inset-0 bg-cyan-900/20 mix-blend-color" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_40%)]" />

            <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl text-center lg:text-left mx-auto lg:mx-0">

              <h1
                className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg tracking-tight"
                data-testid="heading-about"
              >
                {t("About AURA SEA", "Про AURA SEA")}
              </h1>
              <p className="text-lg sm:text-xl font-light leading-relaxed text-white/90 drop-shadow-md">
                {t("Maritime experience, digital innovation, and mental health awareness - where professionalism meets care", "Морський досвід, цифрові інновації та увага до психічного здоров’я — де професіоналізм поєднується з турботою")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        {/* ═══════════ MISSION / VISION / VALUES ═══════════ */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-headline text-3xl font-semibold text-center text-foreground mb-12 scroll-animate">
              {t("Mission, vision & values", "Місія, бачення та цінності")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {missionVisionValues.map((item, i) => {
                const Icon = item.icon;
                return (
                  <MotionCard
                    key={item.title}
                    initial={{ opacity: 0, y: 40, x: 0, scale: 1 }}
                    whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: (0.1 + (i * 0.2)).toFixed(1), ease: "easeOut" }}
                    className={`glass-card h-full text-center group cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30`}
                    data-testid={`card-about-${item.title.toLowerCase()}`}
                  >
                    <CardHeader>
                      <div
                        className={`w-14 h-14 rounded-xl ${item.iconBg} flex items-center justify-center mx-auto mb-2`}
                      >
                        <Icon className={`w-7 h-7 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 ${item.iconClass}`} />
                      </div>
                      <CardTitle className="font-headline text-xl font-medium">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </MotionCard>
                );
              })}
            </div>

            <MotionCard
  initial={{ opacity: 0, y: 40, x: 0, scale: 1 }}
  whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
  className="glass-card group transition-all duration-300 hover:shadow-2xl hover:border-primary/30 hover:shadow-primary/10" data-testid="card-about-company">
              <CardHeader>
                <CardTitle
                  className="font-headline text-2xl sm:text-3xl font-semibold"
                  data-testid="heading-about-company"
                >
                  {t("About the company", "Про компанію")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground font-light leading-relaxed">
                <p className="text-foreground/90 font-normal">{t("Founded in April 2022 in Odesa, Ukraine", "Заснована у квітні 2022 року в Одесі, Україна")}</p>
                <p>
                  {t("Aura Sea Crewing is a professional crewing agency established and operated by experienced seafarers.", "Aura Sea Crewing — професійна крюїнгова агенція, яку заснували й ведуть досвідчені моряки.")}
                </p>
                <p>
                  {t("We specialize in providing qualified and verified Ukrainian crew members for various vessel types, including Container Ships, Bulk Carriers, General Cargo, VLCCs, Tankers, Yachts, and Passenger vessels.", "Ми підбираємо кваліфікованих і перевірених українських моряків для суден різних типів: контейнеровозів, балкерів, суден генерального вантажу, VLCC, танкерів, яхт і пасажирських суден.")}
                </p>
                <p>
                  {t("Our operations are built on modern technology, efficiency, and accountability - ensuring shipowners receive reliable and competent personnel, ready to join worldwide.", "Наша робота спирається на сучасні технології, ефективність і відповідальність — судновласники отримують надійних і компетентних фахівців, готових до посадки в будь-якій точці світу.")}
                </p>
              </CardContent>
            </MotionCard>
          </div>
        </section>

        {/* ═══════════ OUR SYSTEM & TECHNOLOGY — parallel columns ═══════════ */}
        <section className="py-20 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <MotionCard
  initial={{ opacity: 0, y: 40, x: 0, scale: 1 }}
  whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
  className="glass-card h-full flex flex-col group cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30" data-testid="card-our-system">
                <CardHeader className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-teal-400 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-6" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <CardTitle
                      className="font-headline text-2xl sm:text-3xl font-semibold"
                      data-testid="heading-our-system"
                    >
                      {t("Our system", "Наша система")}
                    </CardTitle>
                    <CardDescription className="text-base font-light leading-relaxed">
                      {t("Aura Sea Crewing applies the newest generation of HR technologies and data-driven recruitment algorithms tailored for the maritime industry. We utilize structured evaluation workflows that include:", "Aura Sea Crewing застосовує HR-технології нового покоління та алгоритми підбору на основі даних, створені для морської галузі. Наш структурований процес оцінки включає:")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col">
                  <ul className="space-y-3 text-sm text-muted-foreground font-light flex-1">
                    {[
                      t("Real-time database management and continuous updates", "Базу даних, що оновлюється в реальному часі"),
                      t("Automated verification of maritime documents and certificates", "Автоматизовану перевірку морських документів і сертифікатів"),
                      t("Competency-based interviewing and psychological assessment", "Співбесіди на основі компетенцій і психологічну оцінку"),
                      t("Candidate scoring system based on performance and readiness", "Оцінку кандидатів за результатами роботи та готовністю"),
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground font-light leading-relaxed text-sm border-t border-border/60 pt-6 mt-auto">
                    {t("This ensures every seafarer profile is authentic, current, and job-ready.", "Тож кожна анкета моряка — достовірна, актуальна й готова до роботи.")}
                  </p>
                </CardContent>
              </MotionCard>

              <MotionCard
  initial={{ opacity: 0, y: 40, x: 0, scale: 1 }}
  whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
  className="glass-card h-full flex flex-col group cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 scroll-animate-delay-1"
                data-testid="card-technology"
              >
                <CardHeader className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-400 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <CardTitle
                      className="font-headline text-2xl sm:text-3xl font-semibold"
                      data-testid="heading-technology-innovation"
                    >
                      {t("Technology & innovation", "Технології та інновації")}
                    </CardTitle>
                    <CardDescription className="text-base font-light leading-relaxed">
                      {t("We implement modern HR standards, digital tracking systems, and automated analytics to improve every stage of the crewing process. Our adaptive digital infrastructure allows us to:", "Ми впроваджуємо сучасні HR-стандарти, цифрові системи обліку й автоматизовану аналітику, щоб покращувати кожен етап крюїнгу. Наша гнучка цифрова інфраструктура дає змогу:")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 text-sm text-muted-foreground font-light">
                    {[
                      t("Locate and verify crew members globally", "Знаходити й перевіряти моряків по всьому світу"),
                      t("Reduce recruitment time and administrative workload", "Скорочувати час підбору та адміністративне навантаження"),
                      t("Maintain stable communication between shipowners and crew", "Підтримувати стабільний зв’язок між судновласниками й екіпажем"),
                      t("Guarantee compliance with MLC 2006 and international labor standards", "Гарантувати відповідність MLC 2006 і міжнародним трудовим стандартам"),
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </MotionCard>
            </div>
          </div>
        </section>

        {/* ═══════════ CREW DATABASE & WELLBEING ═══════════ */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <h2
              className="font-headline text-3xl font-semibold text-center text-foreground scroll-animate"
              data-testid="heading-database-wellbeing"
            >
              {t("Crew database & wellbeing", "База моряків і добробут")}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MotionCard
  initial={{ opacity: 0, y: 40, x: 0, scale: 1 }}
  whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
  className="glass-card h-full group cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30" data-testid="card-crew-database">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Database className="w-6 h-6 text-cyan-400 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-6" />
                  </div>
                  <CardTitle className="font-headline text-xl sm:text-2xl font-semibold">{t("Our crew database", "Наша база моряків")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground font-light leading-relaxed text-sm">
                  <p>
                    {t("Our crew database includes over 500 verified professionals across all maritime positions and ranks. Each profile is personally reviewed, regularly updated, and tracked for certification status and contract availability. We maintain direct contact with every candidate, tracking contracts, availability dates, and certification status.", "У нашій базі понад 500 перевірених фахівців усіх морських посад і рангів. Кожну анкету ми переглядаємо особисто, регулярно оновлюємо й стежимо за сертифікатами та готовністю до контракту. Ми на прямому зв’язку з кожним кандидатом і відстежуємо контракти, дати готовності та строки сертифікатів.")}
                  </p>
                  <p>
                    {t("Over the last three years, Aura Sea Crewing has successfully placed more than 200 Ukrainian seafarers on vessels of different types, building long-term partnerships with trusted operators.", "За останні три роки Aura Sea Crewing успішно працевлаштувала понад 200 українських моряків на судна різних типів і збудувала довгострокову співпрацю з надійними операторами.")}
                  </p>
                </CardContent>
              </MotionCard>

              <MotionCard
  initial={{ opacity: 0, y: 40, x: 0, scale: 1 }}
  whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
  className="glass-card h-full group cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 scroll-animate-delay-1" data-testid="card-wellbeing">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-cyan-400 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6" />
                  </div>
                  <CardTitle className="font-headline text-xl sm:text-2xl font-semibold">
                    {t("Wellbeing & psychological support", "Добробут і психологічна підтримка")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-light leading-relaxed text-sm">
                    {t("Beyond recruitment, Aura Sea Crewing is the first Ukrainian agency integrating psychological support programs for seafarers and their families. We believe that mental stability and emotional balance are critical for safe and effective work at sea.", "Крім підбору, Aura Sea Crewing — перша українська агенція, що впроваджує програми психологічної підтримки для моряків і їхніх родин. Ми переконані: психологічна стабільність і емоційна рівновага критично важливі для безпечної та ефективної роботи в морі.")}
                  </p>
                  <p className="text-sm font-medium text-foreground">{t("Our certified psychological partners provide:", "Наші сертифіковані партнери-психологи надають:")}</p>
                  <ul className="space-y-3 text-sm text-muted-foreground font-light">
                    {[
                      t("Support and consultations for seafarers' spouses and relatives", "Підтримку й консультації для дружин, чоловіків і родичів моряків"),
                      t("Stress-resilience sessions for seafarers before and after contracts", "Заняття зі стресостійкості для моряків до і після контракту"),
                      t("Continuous mental health awareness integrated into our HR process", "Постійну увагу до психічного здоров’я як частину нашого HR-процесу"),
                      t("Supporting the mental health of a sailor's wife and improving the quality of long-distance relationships and a comfortable stay together", "Підтримку психічного здоров’я дружини моряка, покращення стосунків на відстані та комфортного часу разом"),
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground font-light leading-relaxed text-sm pt-2 border-t border-border/60">
                    {t("This approach allows us not only to fill vacancies - but to build sustainable, motivated, and mentally healthy maritime teams.", "Такий підхід дає змогу не просто закривати вакансії, а формувати стабільні, вмотивовані й психологічно здорові морські команди.")}
                  </p>
                </CardContent>
              </MotionCard>
            </div>
          </div>
        </section>

        {/* ═══════════ CORE VALUES ═══════════ */}
        <section className="py-20 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-headline text-3xl font-semibold text-center text-foreground mb-12 scroll-animate" data-testid="heading-core-values">
              {t("Our core values", "Наші ключові цінності")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreValues.map((item, i) => {
                const Icon = item.icon;
                return (
                  <MotionCard
                    key={item.title}
                    initial={{ opacity: 0, y: 40, x: 0, scale: 1 }}
                    whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: (0.1 + (Math.min(i, 3) * 0.2)).toFixed(1), ease: "easeOut" }}
                    className={`glass-card h-full group cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30`}
                    data-testid={`card-core-value-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-6 ${item.iconClass}`} />
                      </div>
                      <div>
                        <CardTitle className="font-headline text-lg font-medium mb-2">{item.title}</CardTitle>
                        <CardDescription className="text-sm font-light leading-relaxed">{item.desc}</CardDescription>
                      </div>
                    </CardHeader>
                  </MotionCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ LEADERSHIP ═══════════ */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-headline text-3xl font-semibold text-center text-foreground mb-12 scroll-animate" data-testid="heading-leadership">
              {t("Leadership team", "Команда керівників")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {leadership.map((item, i) => {
                const Icon = item.icon;
                return (
                  <MotionCard
                    key={item.title}
                    initial={{ opacity: 0, y: 40, x: 0, scale: 1 }}
                    whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: (0.1 + (i * 0.2)).toFixed(1), ease: "easeOut" }}
                    className={`glass-card text-center group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30`}
                    data-testid={`card-leadership-${item.badge.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <CardHeader className="items-center pb-2">
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${item.gradient} mb-4 flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-10 h-10 text-primary-foreground transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-[15deg]" />
                      </div>
                      <CardTitle className="font-headline text-lg font-medium">{item.title}</CardTitle>
                      <Badge variant="secondary" className="mt-2 font-light text-xs w-fit mx-auto">
                        {item.badge}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground font-light">{item.desc}</p>
                    </CardContent>
                  </MotionCard>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
