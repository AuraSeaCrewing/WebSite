// Paid services for seafarers (owner's decision 20.11.2026). The pages are not in the menu, the sitemap or
// search results: seafarers reach them from the tiles on "For Seafarers", from the application form and from
// links the agency sends. A request goes to the CRM ("Service requests", POST /api/public/service-request).
//
// Wording rule (owner's decision): no promises of a result. The employer decides on hiring; we prepare the
// seafarer and raise the chances. Every stage is paid, there are no free repeat sessions.

import { Anchor, BadgeCheck, Building2, FileCheck2, Ship, type LucideIcon } from "lucide-react";

import crewImage from "@assets/stock_images/seafarer_crew_workin_81b3ed0a.webp";
import engineImage from "@assets/stock_images/marine_engineer_offi_4366b328.webp";
import portImage from "@assets/stock_images/maritime_shipping_po_c83c1900.webp";
import shipImage from "@assets/stock_images/Gemini_Generated_Image_x18mj0x18mj0x18m.webp";
import seaImage from "@assets/stock_images/venti-views-1cqIcrWFQBI-unsplash.webp";
// Tile pictures from the owner's collage (20.11.2026): icons and captions cut off, the generated logo
// on the folder and the office wall replaced with the real AURA SEA logo.
import crewingTile from "@assets/services/crewing-start.webp";
import documentsTile from "@assets/services/documents.webp";
import interviewTile from "@assets/services/interview.webp";
import promotionTile from "@assets/services/promotion.webp";
import fleetTile from "@assets/services/fleet-change.webp";

export type Text = { en: string; uk: string };
export type ServiceSlug = "crewing-start" | "documents" | "interview" | "promotion" | "fleet-change";
export type PlanKey = "lite" | "pro" | "vip";

export type Plan = { key: PlanKey; name: string; lead: Text; items: Text[]; note?: Text };

export type Service = {
  slug: ServiceSlug;
  icon: LucideIcon;
  image: string;
  /** Picture on the service tile ("For Seafarers", after the application, other services). */
  tile: string;
  /** Which part of the tile picture stays in view (CSS object-position). */
  tileFocus?: string;
  /** Short name for tiles and the CRM. */
  name: Text;
  title: Text;
  lead: Text;
  /** Small label above the title. */
  eyebrow: Text;
  /** Who it is for, in the seafarer's words: the line on the tile. */
  forWhom: Text;
  /** The goal as the seafarer would say it: the quick-choice button in the "For Seafarers" hero. */
  goal: Text;
  /** "Sounds familiar?" — the situations the service is for. */
  pains: Text[];
  /** What we do, step by step. */
  work: { title: Text; text: Text }[];
  /** What the seafarer gets in the end. */
  outcomes: Text[];
  plans?: Plan[];
  meta: Text;
};

const x = (en: string, uk: string): Text => ({ en, uk });

export const SERVICES: Service[] = [
  {
    slug: "crewing-start",
    forWhom: x("Captains and officers who want their own business: Lite, Pro and VIP packages", "Капітанам і офіцерам, які хочуть власну справу: пакети Lite, Pro, VIP"),
    goal: x("Open my own crewing", "Відкрити свій крюїнг"),
    icon: Building2,
    image: portImage,
    tile: crewingTile,
    name: x("Your own crewing agency", "Свій крюїнг"),
    eyebrow: x("For those who want to build their own business", "Для тих, хто хоче власну справу"),
    title: x("Your own crewing agency — with a team that has walked this road", "Власний крюїнг — разом із командою, яка вже пройшла цей шлях"),
    lead: x(
      "From the first documents to the first requests from ship owners. Choose how far we go with you: paperwork only, paperwork with our director's consultations, or a turnkey start with a website, a CRM and partner requests from AURA SEA.",
      "Від перших документів до перших заявок від судновласників. Оберіть, наскільки далеко ми підемо разом: лише документи, документи з консультаціями нашого директора або старт під ключ — із сайтом, CRM і партнерськими заявками від AURA SEA."
    ),
    pains: [
      x("You know the sea and the people, but not where to start with registration and permits", "Ви знаєте море й людей, але не знаєте, з чого почати реєстрацію та дозволи"),
      x("One mistake in the documents can cost months of waiting", "Одна помилка в документах може коштувати місяців очікування"),
      x("There are no ship owners yet — and no first requests", "Ще немає судновласників — а отже, і перших заявок"),
      x("You need a website and a system for the seafarer base, but don't know what to build", "Потрібні сайт і система для бази моряків, але незрозуміло, що саме робити"),
    ],
    work: [
      { title: x("We discuss your plan", "Обговорюємо ваш план"), text: x("Where you want to work, with which fleet and on what scale — and choose the package.", "Де ви хочете працювати, з яким флотом і в якому масштабі — і обираємо пакет.") },
      { title: x("We prepare and file the documents", "Готуємо й подаємо документи"), text: x("The list of requirements, applications and filing — we lead you to the result step by step.", "Перелік вимог, заяви й подання — ведемо вас крок за кроком до результату.") },
      { title: x("We set up the work", "Налаштовуємо роботу"), text: x("Consultations, website, CRM and partner requests — depending on the package.", "Консультації, сайт, CRM і партнерські заявки — залежно від пакета.") },
    ],
    outcomes: [
      x("Documents for crewing activity, prepared and filed without needless rework", "Документи для крюїнгової діяльності, підготовлені й подані без зайвих переробок"),
      x("A clear plan for the first year: clients, seafarers, money", "Зрозумілий план на перший рік: клієнти, моряки, гроші"),
      x("With VIP — a working website, a CRM and the first requests from partners", "З VIP — робочий сайт, CRM і перші заявки від партнерів"),
    ],
    plans: [
      {
        key: "lite",
        name: "Lite",
        lead: x("Documents", "Документи"),
        items: [
          x("Preparation and filing of the documents to start crewing activity", "Оформлення та подання документів для започаткування крюїнгової діяльності"),
          x("The list of requirements and a step-by-step plan", "Перелік вимог і покроковий план"),
          x("Support until the documents are received", "Супровід до отримання документів"),
        ],
      },
      {
        key: "pro",
        name: "Pro",
        lead: x("Lite + consultations of the AURA SEA director", "Lite + консультації директора AURA SEA"),
        items: [
          x("Everything in Lite", "Усе з пакета Lite"),
          x("Personal consultations with the director of AURA SEA", "Особисті консультації директора AURA SEA"),
          x("Working with ship owners: how to find them and what they expect", "Робота із судновласниками: як знайти й чого вони очікують"),
          x("Selecting and checking seafarers, pricing, first-year mistakes", "Підбір і перевірка моряків, ціноутворення, помилки першого року"),
        ],
      },
      {
        key: "vip",
        name: "VIP",
        lead: x("Lite + Pro + website, CRM and partner requests", "Lite + Pro + сайт, CRM і партнерські заявки"),
        items: [
          x("Everything in Lite and Pro", "Усе з пакетів Lite і Pro"),
          x("A website for your agency", "Сайт вашої агенції"),
          x("A CRM for the seafarer base, vacancies and documents", "CRM для бази моряків, заявок і документів"),
          x("Partner requests from AURA SEA on agreed terms", "Партнерські заявки від AURA SEA на погоджених умовах"),
        ],
        note: x("Turnkey", "Під ключ"),
      },
    ],
    meta: x(
      "Start your own crewing agency with AURA SEA: documents, consultations of our director, website, CRM and partner requests. Lite, Pro and VIP packages.",
      "Відкрийте власний крюїнг з AURA SEA: документи, консультації директора, сайт, CRM і партнерські заявки. Пакети Lite, Pro і VIP."
    ),
  },
  {
    slug: "documents",
    forWhom: x("A diploma, endorsement, certificate or medical expiring soon?", "Закінчується диплом, підтвердження, сертифікат чи медкомісія?"),
    goal: x("Sort out documents", "Оформити документи"),
    icon: FileCheck2,
    image: shipImage,
    tile: documentsTile,
    tileFocus: "40% 75%",
    name: x("Maritime documents", "Морські документи"),
    eyebrow: x("Diplomas, endorsements, certificates, seaman's book", "Дипломи, підтвердження, сертифікати, мореходна книжка"),
    title: x("Maritime documents of any complexity", "Оформлення морських документів будь-якої складності"),
    lead: x(
      "We check all your documents and dates, plan what to renew and when, book the courses and file the papers. You go to sea with documents in order — and without queues and refusals over a typo.",
      "Перевіряємо всі ваші документи й терміни, плануємо, що й коли продовжити, записуємо на курси та подаємо документи. Ви йдете в рейс із документами в порядку — без черг і відмов через помилку в заяві."
    ),
    pains: [
      x("A certificate expires in the middle of a contract — or right before joining", "Сертифікат закінчується посеред контракту — або просто перед посадкою"),
      x("Diploma, endorsement, medical, STCW courses: it is hard to keep track of everything", "Диплом, підтвердження, медкомісія, курси STCW — за всім складно встежити"),
      x("Applications come back over a mistake and the time at home runs out", "Заяви повертають через помилку, а час удома закінчується"),
      x("A difficult case: a lost document, data mismatch, a foreign diploma", "Складний випадок: втрачений документ, розбіжність у даних, іноземний диплом"),
    ],
    work: [
      { title: x("Checking documents and dates", "Перевіряємо документи й терміни"), text: x("We go through every document and see what expires and what the next contract requires.", "Проходимо кожен документ і бачимо, що закінчується і чого вимагатиме наступний контракт.") },
      { title: x("A plan with dates", "План із датами"), text: x("What to renew first, which courses to take, how long it takes — in the right order.", "Що продовжувати першим, які курси пройти, скільки це триває — у правильному порядку.") },
      { title: x("Courses and filing", "Курси й подання"), text: x("We book courses in partner training centres, prepare and file the applications.", "Записуємо на курси в партнерські тренажерні центри, готуємо й подаємо заяви.") },
      { title: x("Reminders", "Нагадування"), text: x("We remind you in advance when the next document approaches its expiry.", "Заздалегідь нагадуємо, коли наближається строк наступного документа.") },
    ],
    outcomes: [
      x("Documents in order before the contract, not during it", "Документи в порядку до контракту, а не під час нього"),
      x("Less time in queues and offices", "Менше часу в чергах і кабінетах"),
      x("One contact for all your documents", "Один контакт для всіх ваших документів"),
    ],
    meta: x(
      "Renewal and processing of maritime documents with AURA SEA: diplomas, endorsements, STCW certificates, medical, seaman's book. Difficult cases too.",
      "Продовження та оформлення морських документів з AURA SEA: дипломи, підтвердження, сертифікати STCW, медкомісія, мореходна книжка. Складні випадки теж."
    ),
  },
  {
    slug: "interview",
    forWhom: x("Before an interview with a new company or for a new rank", "Перед співбесідою в нову компанію чи на нову посаду"),
    goal: x("Prepare for an interview", "Підготуватися до співбесіди"),
    icon: BadgeCheck,
    image: crewImage,
    tile: interviewTile,
    name: x("Interview preparation", "Підготовка до співбесіди"),
    eyebrow: x("For any company and any rank", "У будь-яку компанію, на будь-яку посаду"),
    title: x("Come to the interview prepared — and calm", "Прийдіть на співбесіду підготовленим — і спокійним"),
    lead: x(
      "We know how ship owners and crewing companies interview, because we do it every day. We prepare you for a specific company and rank: questions, tests, English and the conversation about salary.",
      "Ми знаємо, як проводять співбесіди судновласники й крюїнгові компанії, бо робимо це щодня. Готуємо вас до конкретної компанії та посади: питання, тести, англійська і розмова про зарплату."
    ),
    pains: [
      x("A strong specialist, but nerves get in the way at the interview", "Сильний спеціаліст, але на співбесіді заважає хвилювання"),
      x("English at the interview is harder than English on board", "Англійська на співбесіді складніша, ніж англійська на борту"),
      x("You don't know what this particular company asks and checks", "Невідомо, що саме питає й перевіряє саме ця компанія"),
      x("You agree to the first salary offered because you don't know how to discuss it", "Погоджуєтеся на першу запропоновану зарплату, бо не знаєте, як її обговорювати"),
    ],
    work: [
      { title: x("We study the company and the rank", "Вивчаємо компанію й посаду"), text: x("What this company asks, which tests it uses, what matters on this type of vessel.", "Що питає ця компанія, які тести використовує, що важливо на цьому типі судна.") },
      { title: x("Mock interview", "Пробна співбесіда"), text: x("A full rehearsal in English with a detailed review of answers.", "Повна репетиція англійською з детальним розбором відповідей.") },
      { title: x("Technical questions and tests", "Технічні питання й тести"), text: x("Typical questions for your rank, preparation for Marlins, CES and similar tests.", "Типові питання для вашої посади, підготовка до тестів Marlins, CES та подібних.") },
      { title: x("Salary and terms", "Зарплата й умови"), text: x("How to present your experience and discuss salary and contract terms.", "Як подати свій досвід і обговорити зарплату та умови контракту.") },
    ],
    outcomes: [
      x("Confidence: you know what to expect and how to answer", "Упевненість: ви знаєте, чого чекати і як відповідати"),
      x("A stronger position in the salary conversation", "Сильніша позиція в розмові про зарплату"),
      x("Calm before the interview instead of guessing", "Спокій перед співбесідою замість здогадок"),
    ],
    meta: x(
      "Interview preparation for seafarers with AURA SEA: mock interviews in English, technical questions, Marlins and CES tests, salary negotiation.",
      "Підготовка моряків до співбесіди з AURA SEA: пробні співбесіди англійською, технічні питання, тести Marlins і CES, розмова про зарплату."
    ),
  },
  {
    slug: "promotion",
    forWhom: x("Motorman → engineer, AB or cadet → 3rd Officer, 3rd → 2nd Engineer", "Моторист → механік, матрос чи кадет → 3-й помічник, 3-й → 2-й механік"),
    goal: x("I want a promotion", "Хочу підвищення"),
    icon: Anchor,
    image: engineImage,
    tile: promotionTile,
    tileFocus: "center 40%",
    name: x("Promotion", "Підвищення в посаді"),
    eyebrow: x("Personal 1-to-1 consultations", "Особисті консультації 1×1"),
    title: x("Your next rank — with a plan, not by chance", "Наступна посада — за планом, а не навмання"),
    lead: x(
      "Motorman to engineer, AB or cadet to 3rd Officer, 3rd Engineer to 2nd. We find what is missing for the next rank, help you close it and prepare you for the interview in the new position.",
      "З моториста в механіки, з матроса чи кадета в третього помічника, з третього механіка в другого. Знаходимо, чого бракує для наступної посади, допомагаємо це закрити й готуємо до співбесіди на нову посаду."
    ),
    pains: [
      x("The diploma is there, but companies take you only in the old rank", "Диплом уже є, але компанії беруть лише на стару посаду"),
      x("Not clear what is missing: sea service, courses or interview skills", "Незрозуміло, чого бракує: стажу, курсів чи вміння пройти співбесіду"),
      x("At the interview for the higher rank the questions are much harder", "На співбесіді на вищу посаду питання значно складніші"),
      x("Years pass in the same rank while others move up", "Роки минають на тій самій посаді, а інші йдуть угору"),
    ],
    work: [
      { title: x("Assessment", "Оцінка"), text: x("Diploma, sea service, courses and experience: what you already have for the next rank and what is missing.", "Диплом, стаж, курси й досвід: що вже є для наступної посади і чого бракує.") },
      { title: x("Promotion plan", "План підвищення"), text: x("Which documents, sea service and courses to get, in what order and by when.", "Які документи, стаж і курси отримати, у якому порядку й до якого строку.") },
      { title: x("1-to-1 consultations", "Консультації 1×1"), text: x("Personal sessions on the duties and the technical questions of the new rank.", "Особисті заняття з обов’язків і технічних питань нової посади.") },
      { title: x("Interview for the new rank", "Співбесіда на нову посаду"), text: x("A rehearsal of the interview exactly for the rank you are going for.", "Репетиція співбесіди саме на ту посаду, на яку ви йдете.") },
    ],
    outcomes: [
      x("A much better chance at the interview for the new rank", "Значно кращі шанси на співбесіді на нову посаду"),
      x("A clear path: what to do and when", "Зрозумілий шлях: що робити й коли"),
      x("When you are ready, we put you forward to ship owners for the new rank", "Коли ви будете готові, ми пропонуємо вас судновласникам на нову посаду"),
    ],
    meta: x(
      "Promotion consultations for seafarers with AURA SEA: motorman to engineer, AB or cadet to 3rd Officer, 3rd to 2nd Engineer. Personal 1-to-1 sessions.",
      "Консультації з підвищення в посаді для моряків з AURA SEA: з моториста в механіки, з матроса чи кадета в третього помічника, з третього механіка в другого. Особисто 1×1."
    ),
  },
  {
    slug: "fleet-change",
    forWhom: x("Bulker → tanker, container → gas carrier, cargo → offshore or passenger", "Балкер → танкер, контейнеровоз → газовоз, вантажне → офшор чи пасажирське"),
    goal: x("Change fleet", "Змінити флот"),
    icon: Ship,
    image: seaImage,
    tile: fleetTile,
    name: x("Fleet change", "Перехід на інший флот"),
    eyebrow: x("A special AURA SEA service", "Особлива послуга AURA SEA"),
    title: x("Move to another fleet — faster and with fewer mistakes", "Перехід на інший флот — швидше й без зайвих помилок"),
    lead: x(
      "Bulkers to tankers, containers to gas carriers, cargo to passenger ships or offshore. Consultations and mentoring from people who work on the type of vessel you want to join — and a crewing agency that puts you forward when you are ready.",
      "З балкерів на танкери, з контейнеровозів на газовози, з вантажних на пасажирські чи в офшор. Консультації й менторство від людей, які працюють саме на тому типі суден, куди ви хочете перейти, — і крюїнг, який запропонує вас, щойно ви будете готові."
    ),
    pains: [
      x("Without experience on the type, companies don't even call back", "Без досвіду на типі компанії навіть не передзвонюють"),
      x("Not clear which courses really matter and which are a waste of money", "Незрозуміло, які курси справді потрібні, а які — викинуті гроші"),
      x("You can lose a year trying to switch on your own", "На самостійний перехід можна втратити рік"),
      x("Nobody to ask how the work on that type of vessel really looks", "Немає кого спитати, як насправді виглядає робота на цьому типі суден"),
    ],
    work: [
      { title: x("Choosing the direction", "Обираємо напрям"), text: x("Which fleet suits your rank, experience and goals — and what the switch requires.", "Який флот підходить вашій посаді, досвіду й цілям — і чого вимагає перехід.") },
      { title: x("Mentor from the fleet", "Ментор із флоту"), text: x("Consultations with a specialist working on the chosen type of vessels.", "Консультації зі спеціалістом, який працює на обраному типі суден.") },
      { title: x("Courses and documents", "Курси й документи"), text: x("Only what is really required for the switch — in the right order.", "Лише те, що справді потрібно для переходу, — у правильному порядку.") },
      { title: x("First contract on the new fleet", "Перший контракт на новому флоті"), text: x("When your documents and preparation meet the requirements, you are the first we put forward for a suitable vacancy.", "Коли ваші документи й підготовка відповідатимуть вимогам, ви — перший, кого ми запропонуємо на відповідну вакансію.") },
    ],
    outcomes: [
      x("Saved time: no guessing and no unnecessary courses", "Збережений час: без здогадок і зайвих курсів"),
      x("A much better chance of the first contract on the new fleet", "Значно кращі шанси на перший контракт на новому флоті"),
      x("Priority recommendation from AURA SEA for suitable vacancies", "Першочергова рекомендація від AURA SEA на відповідні вакансії"),
    ],
    meta: x(
      "Fleet change for seafarers with AURA SEA: mentoring from specialists of the chosen vessel type, the right courses, priority recommendation for vacancies.",
      "Перехід на інший флот з AURA SEA: менторство від спеціалістів обраного типу суден, потрібні курси, першочергова рекомендація на вакансії."
    ),
  },
];

/** Order on "For Seafarers": the most asked-for first; own crewing (a different audience) last. */
export const SERVICE_ORDER: ServiceSlug[] = ["promotion", "fleet-change", "interview", "documents", "crewing-start"];
export const orderedServices = () => SERVICE_ORDER.map((slug) => SERVICES.find((s) => s.slug === slug)!);

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
