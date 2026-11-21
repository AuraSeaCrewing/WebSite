import type { ReactNode } from "react";
import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";
import { useLang, usePageMeta, type Lang } from "@/lib/i18n";

// Privacy Policy / Політика конфіденційності.
// Describes what the site and the AURA SEA CRM actually do (application form → CRM draft reviewed by a
// recruiter, CVs parsed with AI and checked by a person, no cookies or analytics on the site).
// When a data flow changes (new form, analytics, a new service provider), update this page and EFFECTIVE_DATE.

const EFFECTIVE_DATE = { en: "19 November 2026", uk: "19 листопада 2026 р." };

/**
 * Data controller. Fill in the legal entity details: fields left empty are not shown.
 * The legal name and registration code are required by Art. 12 of the Law of Ukraine
 * "On Personal Data Protection" and Art. 13 GDPR (identity of the controller).
 */
export const COMPANY = {
  brand: "AURA SEA",
  // Individual entrepreneur (ФОП). Her tax number (РНОКПП) is personal data and is deliberately not published here
  legalName: { en: "Individual Entrepreneur Anastasiia Prodius", uk: "ФОП Продіус Анастасія Олегівна" },
  /** Entry in the Ministry of Economy list of employment-abroad intermediaries (declaration date / number). */
  intermediaryRegister: {
    en: "Included in the list of businesses providing employment-abroad intermediation services kept by the Ministry of Economy of Ukraine (declaration of 06.05.2026; Ministry letter No. 4804-06/45115-07 of 13.05.2026)",
    uk: "Включена до переліку суб’єктів господарювання, що надають послуги у сфері посередництва у працевлаштуванні за кордоном, Мінекономіки (декларація від 06.05.2026; лист Мінекономіки № 4804-06/45115-07 від 13.05.2026)",
  },
  address: { en: "77 Prokhorovska St, Odesa, Ukraine", uk: "вул. Прохоровська, 77, м. Одеса, Україна" },
  email: "crewing@aurasea.org",
  phone: "+380 97 845 8147",
  phoneHref: "+380978458147",
};


function H2({ id, n, children }: { id: string; n: number; children: ReactNode }) {
  return (
    <h2 id={id} className="font-headline text-2xl font-semibold text-foreground mt-12 mb-4 scroll-mt-28">
      <span className="text-cyan-400 mr-2">{n}.</span>
      {children}
    </h2>
  );
}
const P = ({ children }: { children: ReactNode }) => <p className="text-muted-foreground font-light leading-relaxed mb-4">{children}</p>;
const UL = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc pl-6 text-muted-foreground font-light leading-relaxed space-y-2 mb-4 marker:text-cyan-400">{children}</ul>
);
const B = ({ children }: { children: ReactNode }) => <strong className="font-medium text-foreground">{children}</strong>;
const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-cyan-400 hover:underline break-words">
    {children}
  </a>
);

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto mb-6 rounded-lg border border-border/60">
      <table className="w-full text-sm text-left">
        <thead className="bg-cyan-500/10">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-medium text-foreground align-top">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/60">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3 text-muted-foreground font-light align-top leading-relaxed">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ControllerCard({ lang }: { lang: Lang }) {
  const l = (en: string, uk: string) => (lang === "en" ? en : uk);
  const name = COMPANY.legalName[lang];
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-5 mb-4 space-y-1 text-sm">
      <p className="text-foreground font-medium">{name ? `${name} (${COMPANY.brand})` : COMPANY.brand}</p>
      {COMPANY.intermediaryRegister[lang] && <p className="text-muted-foreground">{COMPANY.intermediaryRegister[lang]}</p>}
      <p className="text-muted-foreground">{COMPANY.address[lang]}</p>
      <p className="text-muted-foreground">
        Email: <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A>
      </p>
      <p className="text-muted-foreground">
        {l("Phone / WhatsApp / Telegram", "Телефон / WhatsApp / Telegram")}: <A href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</A>
      </p>
    </div>
  );
}

const OMBUDSMAN = "https://ombudsman.gov.ua";
const EDPB_MEMBERS = "https://www.edpb.europa.eu/about-edpb/about-edpb/members_en";

const SECTIONS: Record<Lang, { id: string; title: string }[]> = {
  en: [
    { id: "who", title: "Who we are" },
    { id: "scope", title: "What this policy covers" },
    { id: "data", title: "What data we collect" },
    { id: "dont", title: "What we do not want to receive" },
    { id: "purposes", title: "Why we use your data and on what legal basis" },
    { id: "ai", title: "Use of AI and human review" },
    { id: "recipients", title: "Who receives your data" },
    { id: "transfers", title: "Transfers outside Ukraine and the EU" },
    { id: "retention", title: "How long we keep your data" },
    { id: "security", title: "How we protect your data" },
    { id: "rights", title: "Your rights" },
    { id: "complaints", title: "Complaints" },
    { id: "cookies", title: "Cookies, statistics and browser storage" },
    { id: "minors", title: "Minors" },
    { id: "changes", title: "Changes to this policy" },
  ],
  uk: [
    { id: "who", title: "Хто ми" },
    { id: "scope", title: "Що охоплює ця політика" },
    { id: "data", title: "Які дані ми збираємо" },
    { id: "dont", title: "Що нам не потрібно надсилати" },
    { id: "purposes", title: "Навіщо ми використовуємо дані та на якій підставі" },
    { id: "ai", title: "Використання штучного інтелекту та перевірка людиною" },
    { id: "recipients", title: "Хто отримує ваші дані" },
    { id: "transfers", title: "Передача за межі України та ЄС" },
    { id: "retention", title: "Скільки ми зберігаємо дані" },
    { id: "security", title: "Як ми захищаємо дані" },
    { id: "rights", title: "Ваші права" },
    { id: "complaints", title: "Скарги" },
    { id: "cookies", title: "Файли cookie, статистика та сховище браузера" },
    { id: "minors", title: "Неповнолітні" },
    { id: "changes", title: "Зміни до політики" },
  ],
};

function English() {
  const s = SECTIONS.en;
  let n = 0;
  const h = (i: number) => <H2 id={s[i].id} n={++n}>{s[i].title}</H2>;
  return (
    <>
      {h(0)}
      <P>
        AURA SEA is a Ukrainian crewing agency: we help seafarers find work on board and help ship-owners and ship managers find crew. AURA SEA
        is the trade name of Individual Entrepreneur Anastasiia Prodius, who is the <B>data controller</B> for the personal data described here
        (in Ukrainian law, the <i>owner</i> of personal data). This means we decide why and how the data is used and we are responsible for it.
      </P>
      <ControllerCard lang="en" />
      <P>
        For any question about your data, or to use your rights, write to <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A> with the subject
        “Personal data”.
      </P>

      {h(1)}
      <P>This policy applies to personal data we receive:</P>
      <UL>
        <li>through this website, including the <Link href="/apply" className="text-cyan-400 hover:underline">seafarer application form</Link> and the contact form;</li>
        <li>when you send us your CV or application form by email, Telegram, WhatsApp, Viber or through job portals;</li>
        <li>when we work with you as a candidate or as a seafarer we have placed on board;</li>
        <li>from contact persons of ship-owners, ship managers and training centres we work with.</li>
      </UL>
      <P>
        We process data under the Law of Ukraine “On Personal Data Protection” No. 2297-VI. Where you are in the European Union or the European
        Economic Area, we also follow the EU General Data Protection Regulation (GDPR). Our recruitment and placement work follows the
        principles of the Maritime Labour Convention, 2006 (Regulation 1.4).
      </P>

      {h(2)}
      <Table
        head={["Source", "Data"]}
        rows={[
          [
            <B>Application form on this website</B>,
            "Name, date and place of birth, citizenship, sex, marital status; phone, email, WhatsApp, Viber, Telegram, home address, nearest airport; position wanted, availability date, expected salary, level of English, current status, information about yourself; passport, seaman’s book and visa details (numbers, countries, dates); certificates (names, numbers, issuing bodies, dates); sea service (vessels, types, flags, DWT, IMO, engine, ship-owners, crewing agencies, ranks, dates); height, weight, overall and shoe size; next-of-kin name, relation and phone.",
          ],
          [
            <B>CV or application form you send us</B>,
            "The same kinds of data as above, as they appear in your document, and your photo if the CV contains one (it becomes the picture in your profile). From the covering email: your email address and what you write about your availability and the position you want.",
          ],
          [<B>Contact form</B>, "Name, email, phone, subject and message."],
          [
            <B>During our cooperation</B>,
            "Notes of calls and messages, vacancies we proposed you for and the result, contracts and sign-on / sign-off dates, training courses and payments for them, and factual feedback about completed contracts from the ship-owner, the master or our office.",
          ],
          [
            <B>From third parties</B>,
            "Ship-owners and ship managers (approval or rejection for a vacancy, contract feedback), training centres (course bookings and certificates issued), job portals you used to apply to us.",
          ],
          [
            <B>Technical data</B>,
            "When you open the website, our hosting provider’s web server records your IP address, browser type and the pages requested in standard server logs, which are used for security and troubleshooting.",
          ],
        ]}
      />
      <P>
        Fields marked as required in the application form (name, date of birth, citizenship, phone, email, position) are needed so that we can
        consider your application and contact you. Everything else is optional, but the more you tell us, the better we can match you with a
        vacancy.
      </P>

      {h(3)}
      <P>Please do not send us, in the form, a CV or a message:</P>
      <UL>
        <li>bank account or card numbers;</li>
        <li>medical diagnoses, test results or your medical history. We only need to know whether your medical certificate says you are fit for duty, with any limitations, and its validity date;</li>
        <li>information about your religion, or passport details of your relatives.</li>
      </UL>
      <P>
        If a document you send contains such information, we do not copy it into our database. Account and card numbers are removed
        automatically, and the original file is deleted after a recruiter has reviewed it (see section 9).
      </P>

      {h(4)}
      <Table
        head={["Purpose", "Legal basis"]}
        rows={[
          [
            "Considering your application, matching you with vacancies, contacting you about suitable positions",
            "Your consent given when you submit the application form or send us your CV (Art. 11 of Law No. 2297-VI; Art. 6(1)(a) GDPR), and steps taken at your request before entering into an employment contract (Art. 6(1)(b) GDPR)",
          ],
          [
            "Presenting your profile to a ship-owner or ship manager for a specific vacancy",
            "Your consent, including consent to the transfer abroad (Art. 29 of Law No. 2297-VI; Art. 49(1)(a) GDPR) and steps towards the employment contract you applied for (Art. 6(1)(b) GDPR)",
          ],
          [
            "Arranging your employment, travel, documents and training courses once you have accepted a position",
            "Performance of our agreement with you (Art. 6(1)(b) GDPR) and your consent",
          ],
          [
            "Keeping track of the validity of your certificates and documents and reminding you to renew them",
            "Our legitimate interest in offering you our document and training services (Art. 6(1)(f) GDPR) and your consent. You can ask us to stop at any time",
          ],
          [
            "Keeping a register of seafarers we have recruited and placed, and records of contracts and payments",
            "Legal obligations of a recruitment and placement service and accounting rules (Art. 6(1)(c) GDPR); MLC, 2006, Standard A1.4",
          ],
          [
            "Answering messages sent through the contact form",
            "Your consent / our legitimate interest in answering you",
          ],
          [
            "Protecting the website and our systems, preventing fraud and spam",
            "Our legitimate interest (Art. 6(1)(f) GDPR)",
          ],
        ]}
      />
      <P>We do not sell your personal data and we do not use it for advertising.</P>

      {h(5)}
      <P>
        When you send us a CV or application form as a file (by email or otherwise), our system uses an AI language model provided by Anthropic
        to read the document and fill in a draft of your profile, so that a recruiter does not have to retype it. <B>A recruiter always checks the
        draft</B> and nothing is saved to your profile until they confirm it. Applications submitted through the website form are not processed
        by AI: your answers go directly into a draft for the recruiter.
      </P>
      <P>
        Decisions about you — whether to propose you for a vacancy, and whom a ship-owner hires — are made by people, not by an automated
        system. You have the right to ask how your data was processed and to have any automated result reviewed by a person.
      </P>

      {h(6)}
      <P>We share your data only as far as needed for the purposes above:</P>
      <UL>
        <li>
          <B>Ship-owners and ship managers</B> — your profile (the AURA SEA application form or a summary without your contact details) for a
          specific vacancy, so they can approve or reject your candidature. They become separate controllers of the data they receive.
        </li>
        <li>
          <B>Training centres and medical centres</B> — your name, date of birth, rank and document details, when you ask us to book a course or
          medical examination for you.
        </li>
        <li>
          <B>Public authorities</B> — when the law requires it (for example, maritime administration, migration or law-enforcement bodies acting
          within their powers).
        </li>
        <li>
          <B>Our service providers (processors)</B>, who act only on our instructions:
        </li>
      </UL>
      <Table
        head={["Provider", "What they do for us"]}
        rows={[
          ["Asura Hosting", "Hosts this website and our server with the candidate database (CRM) and visit statistics"],
          ["Google (Gmail / Google Workspace)", "Our email: messages and CVs you send to us"],
          ["Anthropic", "AI reading of CV and application files (see section 6). Under Anthropic’s commercial terms, data sent through its API is not used to train its models"],
          ["Web3Forms", "Delivers messages from the website contact form to our email"],
        ]}
      />
      <P>Access to your data inside AURA SEA is limited to our recruiters and managers who need it for their work.</P>

      {h(7)}
      <P>
        Seafaring is international, and the ship-owners and ship managers we work with are based in many countries, including countries outside
        Ukraine and the European Economic Area that may not offer the same level of data protection. We send your profile to a ship-owner only
        in connection with a vacancy, and only the data needed for that vacancy. By submitting your application you give your consent to such
        transfers (Art. 29 of Law No. 2297-VI; Art. 49(1)(a) GDPR); the transfer is also necessary for the employment contract you are applying
        for.
      </P>
      <P>
        Some of our service providers (Google, Anthropic) process data in the United States and other countries. Where GDPR applies, they provide
        safeguards such as the EU Standard Contractual Clauses.
      </P>

      {h(8)}
      <UL>
        <li>
          <B>Original files</B> (the CV or application you send) are kept in our system only until a recruiter has reviewed them, then deleted.
          Copies may remain in our email.
        </li>
        <li>
          <B>Your seafarer profile</B> is kept while you remain our candidate, so that we can offer you new vacancies and keep track of your
          documents. You can ask us to delete it at any time.
        </li>
        <li>
          <B>The register of seafarers we have placed</B>, contracts and payment records are kept for as long as required by law and by the rules
          for recruitment and placement services, even after you ask us to stop contacting you.
        </li>
        <li>
          <B>Contact form messages</B> are kept in our email for as long as needed to answer you and follow up.
        </li>
        <li>
          <B>Server logs</B> are kept by the hosting provider for a limited period for security purposes.
        </li>
      </UL>

      {h(9)}
      <UL>
        <li>The website and our database work only over encrypted HTTPS connections.</li>
        <li>Access to the database is personal, protected by passwords and two-factor authentication, and limited by role; every access to candidate records is logged.</li>
        <li>Recruiters cannot export lists of seafarers; the number of profiles one person can open per day is limited.</li>
        <li>The database is backed up every night; backups are encrypted.</li>
        <li>Document contents and AI results are not written to technical logs.</li>
      </UL>
      <P>
        If a breach of security affects your data and creates a risk to you, we will inform you and, where required, the supervisory authority.
      </P>

      {h(10)}
      <P>Under Ukrainian law (Art. 8 of Law No. 2297-VI) and, where it applies, the GDPR, you have the right to:</P>
      <UL>
        <li>know who processes your data, for what purpose and where it is stored, and to whom it is transferred;</li>
        <li>get access to your data and a copy of it;</li>
        <li>have inaccurate or outdated data corrected;</li>
        <li>have your data deleted, or its processing restricted, unless we must keep it by law;</li>
        <li>object to processing based on our legitimate interest, including reminders about your documents;</li>
        <li>withdraw your consent at any time — this does not affect processing that took place before;</li>
        <li>receive the data you gave us in a commonly used electronic format (data portability, GDPR);</li>
        <li>not be subject to a decision based solely on automated processing;</li>
        <li>complain to a supervisory authority or a court (section 12).</li>
      </UL>
      <P>
        To use these rights, write to <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A>. We may ask you to confirm your identity, for
        example from the phone number or email we have on file. We answer within 30 days, free of charge.
      </P>

      {h(11)}
      <P>
        If you believe we process your data unlawfully, please contact us first — we will try to resolve it. You may also complain to the
        Ukrainian Parliament Commissioner for Human Rights (<A href={OMBUDSMAN}>ombudsman.gov.ua</A>), the supervisory authority for personal data
        in Ukraine, or to a court. If you are in the EU or EEA, you can complain to the data protection authority of your country (
        <A href={EDPB_MEMBERS}>list of authorities</A>).
      </P>

      {h(12)}
      <P>
        This website <B>does not use cookies</B> or advertising trackers, and does not load fonts or scripts from third-party services.
      </P>
      <P>
        We count visits with <B>Umami</B>, an open-source statistics tool that runs on our own server (stats.aurasea.org) and is not shared
        with anyone. It records the page, the website or app you came from (for example Google or Threads), your country, device type and
        browser, and actions such as sending the application form. It does not use cookies, does not store your IP address and does not
        identify you or follow you across other websites; visits are counted with an anonymous identifier that changes regularly. We use
        these figures to understand how people find us and to improve the website (our legitimate interest, Art. 6(1)(f) GDPR). If you
        block the statistics script in your browser, the website works the same.
      </P>
      <P>
        The application form saves your unfinished answers in your browser’s local storage, only on your device, so that you do not lose them if
        you close the page. They are deleted after you send the form; you can also clear them in your browser settings. Your choice of language (Ukrainian or English) is remembered the same way, so we do not ask again.
      </P>
      <P>
        Links to Telegram, Instagram, LinkedIn, Facebook and WhatsApp lead to those services, which have their own privacy policies.
      </P>

      {h(13)}
      <P>
        Our services are intended for adults. Cadets and other applicants under 18 should contact us before applying; we will ask for the consent
        of a parent or guardian where the law requires it.
      </P>

      {h(14)}
      <P>
        We will update this policy when our work with personal data changes. The date at the top shows when it last changed. If a change is
        significant, we will inform the seafarers in our database.
      </P>
    </>
  );
}

function Ukrainian() {
  const s = SECTIONS.uk;
  let n = 0;
  const h = (i: number) => <H2 id={s[i].id} n={++n}>{s[i].title}</H2>;
  return (
    <>
      {h(0)}
      <P>
        AURA SEA — українська крюїнгова агенція: ми допомагаємо морякам знайти роботу на судні, а судновласникам і менеджерам — екіпаж. AURA SEA —
        торговельна назва ФОП Продіус Анастасії Олегівни, яка є <B>володільцем персональних даних</B>, описаних тут (за GDPR — контролером). Тобто
        ми визначаємо мету і спосіб їх обробки та відповідаємо за неї.
      </P>
      <ControllerCard lang="uk" />
      <P>
        З будь-яких питань щодо ваших даних або щоб скористатися своїми правами, напишіть на <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A>{" "}
        з темою «Персональні дані».
      </P>

      {h(1)}
      <P>Політика стосується персональних даних, які ми отримуємо:</P>
      <UL>
        <li>через цей сайт, зокрема <Link href="/apply" className="text-cyan-400 hover:underline">анкету моряка</Link> і форму зворотного зв’язку;</li>
        <li>коли ви надсилаєте резюме чи анкету електронною поштою, у Telegram, WhatsApp, Viber або через сайти вакансій;</li>
        <li>під час роботи з вами як з кандидатом або моряком, якого ми працевлаштували;</li>
        <li>від контактних осіб судновласників, менеджерів суден і тренажерних центрів, з якими ми співпрацюємо.</li>
      </UL>
      <P>
        Ми обробляємо дані відповідно до Закону України «Про захист персональних даних» № 2297-VI. Якщо ви перебуваєте в Європейському Союзі чи
        Європейській економічній зоні, ми також дотримуємося Загального регламенту ЄС про захист даних (GDPR). Наша діяльність з набору та
        працевлаштування моряків ґрунтується на принципах Конвенції про працю в морському судноплавстві 2006 року (MLC, правило 1.4).
      </P>

      {h(2)}
      <Table
        head={["Джерело", "Дані"]}
        rows={[
          [
            <B>Анкета на сайті</B>,
            "Ім’я та прізвище, дата і місце народження, громадянство, стать, сімейний стан; телефон, email, WhatsApp, Viber, Telegram, домашня адреса, найближчий аеропорт; бажана посада, дата готовності, очікувана зарплата, рівень англійської, поточний статус, інформація про себе; дані закордонного паспорта, мореплавної книжки і віз (номери, країни, дати); сертифікати (назви, номери, ким видані, дати); стаж (судна, типи, прапори, DWT, IMO, двигун, судновласники, крюїнгові агенції, посади, дати); зріст, вага, розмір комбінезона і взуття; ім’я, ступінь спорідненості й телефон контактної особи.",
          ],
          [
            <B>Резюме чи анкета, які ви надсилаєте</B>,
            "Ті самі види даних, як вони вказані у вашому документі, і фото, якщо воно є в резюме (стає фото у вашому профілі). З листа: ваша адреса email і те, що ви пишете про готовність та бажану посаду.",
          ],
          [<B>Форма зворотного зв’язку</B>, "Ім’я, email, телефон, тема і текст повідомлення."],
          [
            <B>Під час співпраці</B>,
            "Нотатки дзвінків і повідомлень, вакансії, на які ми вас пропонували, і результат, контракти й дати посадки та списання, навчальні курси й оплати за них, фактичні відгуки про виконані контракти від судновласника, капітана або нашого офісу.",
          ],
          [
            <B>Від третіх осіб</B>,
            "Судновласники та менеджери суден (погодження чи відмова за вакансією, відгук про контракт), тренажерні центри (запис на курси, видані сертифікати), сайти вакансій, через які ви до нас звернулися.",
          ],
          [
            <B>Технічні дані</B>,
            "Коли ви відкриваєте сайт, вебсервер нашого хостинг-провайдера записує IP-адресу, тип браузера й запитані сторінки у стандартні журнали сервера, які використовуються для безпеки та усунення збоїв.",
          ],
        ]}
      />
      <P>
        Обов’язкові поля анкети (ім’я, дата народження, громадянство, телефон, email, посада) потрібні, щоб ми могли розглянути анкету і
        зв’язатися з вами. Решта — за бажанням, але що більше ви розповісте, то точніше ми підберемо вакансію.
      </P>

      {h(3)}
      <P>Будь ласка, не надсилайте нам в анкеті, резюме чи повідомленні:</P>
      <UL>
        <li>номери банківських рахунків і карток;</li>
        <li>медичні діагнози, результати аналізів чи історію хвороб. Нам потрібно знати лише висновок медичного сертифіката про придатність (з обмеженнями, якщо вони є) і строк його дії;</li>
        <li>відомості про віросповідання та паспортні дані родичів.</li>
      </UL>
      <P>
        Якщо ваш документ містить такі відомості, ми не переносимо їх до нашої бази. Номери рахунків і карток вилучаються автоматично, а
        оригінал файлу видаляється після перевірки рекрутером (див. розділ 9).
      </P>

      {h(4)}
      <Table
        head={["Мета", "Правова підстава"]}
        rows={[
          [
            "Розгляд анкети, підбір вакансій, зв’язок з вами щодо відповідних посад",
            "Ваша згода, надана під час подання анкети чи надсилання резюме (ст. 11 Закону № 2297-VI; ст. 6(1)(a) GDPR), і дії на ваш запит до укладення трудового договору (ст. 6(1)(b) GDPR)",
          ],
          [
            "Представлення вашої анкети судновласнику чи менеджеру судна під конкретну вакансію",
            "Ваша згода, зокрема на передачу за кордон (ст. 29 Закону № 2297-VI; ст. 49(1)(a) GDPR), і дії для укладення трудового договору, на який ви претендуєте (ст. 6(1)(b) GDPR)",
          ],
          [
            "Організація працевлаштування, поїздки, документів і навчання після того, як ви погодилися на посаду",
            "Виконання домовленості з вами (ст. 6(1)(b) GDPR) і ваша згода",
          ],
          [
            "Відстеження строків дії ваших сертифікатів і документів та нагадування про їх продовження",
            "Наш законний інтерес у наданні вам послуг з оформлення документів і навчання (ст. 6(1)(f) GDPR) і ваша згода. Ви можете відмовитися в будь-який момент",
          ],
          [
            "Ведення реєстру моряків, яких ми набрали та працевлаштували, облік контрактів і платежів",
            "Обов’язки служби набору та працевлаштування і правила бухгалтерського обліку (ст. 6(1)(c) GDPR); MLC 2006, стандарт A1.4",
          ],
          ["Відповіді на повідомлення з форми зворотного зв’язку", "Ваша згода / наш законний інтерес відповісти вам"],
          ["Захист сайту й наших систем, запобігання шахрайству та спаму", "Наш законний інтерес (ст. 6(1)(f) GDPR)"],
        ]}
      />
      <P>Ми не продаємо персональні дані і не використовуємо їх для реклами.</P>

      {h(5)}
      <P>
        Коли ви надсилаєте резюме чи анкету файлом (поштою або інакше), наша система за допомогою мовної моделі штучного інтелекту компанії
        Anthropic читає документ і заповнює чернетку вашого профілю, щоб рекрутеру не доводилося передруковувати її вручну.{" "}
        <B>Рекрутер завжди перевіряє чернетку</B>, і нічого не записується у ваш профіль без його підтвердження. Анкети, подані через форму на
        сайті, штучним інтелектом не обробляються: ваші відповіді одразу потрапляють у чернетку для рекрутера.
      </P>
      <P>
        Рішення щодо вас — чи пропонувати вас на вакансію і кого бере на роботу судновласник — ухвалюють люди, а не автоматизована система. Ви
        маєте право знати механізм обробки ваших даних і вимагати перегляду людиною будь-якого автоматизованого результату.
      </P>

      {h(6)}
      <P>Ми передаємо дані лише в обсязі, потрібному для цілей, наведених вище:</P>
      <UL>
        <li>
          <B>Судновласникам і менеджерам суден</B> — вашу анкету (бланк AURA SEA або стислі відомості без контактів) під конкретну вакансію, щоб
          вони погодили чи відхилили вашу кандидатуру. Отримані дані вони обробляють як окремі володільці.
        </li>
        <li>
          <B>Тренажерним і медичним центрам</B> — ім’я, дату народження, посаду й дані документів, коли ви просите записати вас на курс чи
          медогляд.
        </li>
        <li>
          <B>Державним органам</B> — коли цього вимагає закон (наприклад, морська адміністрація, міграційні чи правоохоронні органи в межах їхніх
          повноважень).
        </li>
        <li>
          <B>Нашим постачальникам послуг (розпорядникам)</B>, які діють лише за нашими вказівками:
        </li>
      </UL>
      <Table
        head={["Постачальник", "Що робить для нас"]}
        rows={[
          ["Asura Hosting", "Хостинг цього сайту і нашого сервера з базою кандидатів (CRM) та статистикою відвідувань"],
          ["Google (Gmail / Google Workspace)", "Наша електронна пошта: листи й резюме, які ви нам надсилаєте"],
          ["Anthropic", "Читання файлів резюме та анкет штучним інтелектом (розділ 6). За комерційними умовами Anthropic дані, надіслані через її API, не використовуються для навчання моделей"],
          ["Web3Forms", "Доставляє повідомлення з форми зворотного зв’язку на нашу пошту"],
        ]}
      />
      <P>Усередині AURA SEA доступ до ваших даних мають лише рекрутери та менеджери, яким він потрібен для роботи.</P>

      {h(7)}
      <P>
        Морська галузь міжнародна: судновласники й менеджери суден, з якими ми працюємо, розташовані в різних країнах, зокрема за межами України
        та Європейської економічної зони, де рівень захисту даних може бути іншим. Ми надсилаємо вашу анкету судновласнику лише у зв’язку з
        вакансією і лише ті дані, що потрібні для неї. Подаючи анкету, ви надаєте згоду на таку передачу (ст. 29 Закону № 2297-VI; ст. 49(1)(a)
        GDPR); передача також необхідна для трудового договору, на який ви претендуєте.
      </P>
      <P>
        Деякі наші постачальники послуг (Google, Anthropic) обробляють дані у США та інших країнах. Якщо застосовується GDPR, вони надають
        гарантії, зокрема стандартні договірні положення ЄС.
      </P>

      {h(8)}
      <UL>
        <li>
          <B>Оригінали файлів</B> (резюме чи анкета, які ви надіслали) зберігаються в нашій системі лише до перевірки рекрутером, після чого
          видаляються. Копії можуть залишатися в нашій пошті.
        </li>
        <li>
          <B>Ваш профіль моряка</B> зберігається, поки ви залишаєтеся нашим кандидатом, щоб ми могли пропонувати нові вакансії та стежити за
          строками документів. Ви можете попросити видалити його в будь-який момент.
        </li>
        <li>
          <B>Реєстр працевлаштованих моряків</B>, контракти й записи про платежі зберігаються стільки, скільки вимагають закон і правила для
          служб набору та працевлаштування, навіть якщо ви попросили більше з вами не зв’язуватися.
        </li>
        <li>
          <B>Повідомлення з форми зворотного зв’язку</B> зберігаються в пошті, поки це потрібно, щоб відповісти вам.
        </li>
        <li>
          <B>Журнали сервера</B> хостинг-провайдер зберігає обмежений час для цілей безпеки.
        </li>
      </UL>

      {h(9)}
      <UL>
        <li>Сайт і наша база працюють лише через зашифроване з’єднання HTTPS.</li>
        <li>Доступ до бази персональний, захищений паролем і двофакторною автентифікацією та обмежений роллю; кожне звернення до анкет кандидатів записується в журнал.</li>
        <li>Рекрутери не можуть вивантажувати списки моряків; кількість профілів, які одна людина може відкрити за день, обмежена.</li>
        <li>Резервні копії бази робляться щоночі й зберігаються зашифрованими.</li>
        <li>Зміст документів і результати роботи штучного інтелекту не записуються в технічні журнали.</li>
      </UL>
      <P>
        Якщо порушення безпеки зачепить ваші дані і створить ризик для вас, ми повідомимо вас і, коли це потрібно, наглядовий орган.
      </P>

      {h(10)}
      <P>Відповідно до ст. 8 Закону № 2297-VI та, якщо застосовується, GDPR, ви маєте право:</P>
      <UL>
        <li>знати, хто обробляє ваші дані, з якою метою, де вони зберігаються і кому передаються;</li>
        <li>отримати доступ до своїх даних і їх копію;</li>
        <li>вимагати виправлення неточних або застарілих даних;</li>
        <li>вимагати видалення даних чи обмеження їх обробки, якщо закон не зобов’язує нас їх зберігати;</li>
        <li>заперечити проти обробки на підставі нашого законного інтересу, зокрема проти нагадувань про документи;</li>
        <li>відкликати згоду в будь-який момент — це не впливає на обробку, що відбулася раніше;</li>
        <li>отримати надані вами дані в поширеному електронному форматі (перенесення даних, GDPR);</li>
        <li>не бути об’єктом рішення, ухваленого виключно на підставі автоматизованої обробки;</li>
        <li>звернутися зі скаргою до наглядового органу чи суду (розділ 12).</li>
      </UL>
      <P>
        Щоб скористатися правами, напишіть на <A href={`mailto:${COMPANY.email}`}>{COMPANY.email}</A>. Ми можемо попросити підтвердити особу,
        наприклад з номера телефону чи email, які є в нас. Відповідаємо протягом 30 днів, безкоштовно.
      </P>

      {h(11)}
      <P>
        Якщо ви вважаєте, що ми обробляємо ваші дані з порушенням, спершу зверніться до нас — ми спробуємо вирішити питання. Ви також можете
        поскаржитися Уповноваженому Верховної Ради України з прав людини (<A href={OMBUDSMAN}>ombudsman.gov.ua</A>), який здійснює контроль за
        захистом персональних даних, або до суду. Якщо ви перебуваєте в ЄС чи ЄЕЗ — до органу із захисту даних своєї країни (
        <A href={EDPB_MEMBERS}>перелік органів</A>).
      </P>

      {h(12)}
      <P>
        Цей сайт <B>не використовує файли cookie</B> і рекламні трекери та не завантажує шрифти чи скрипти зі сторонніх сервісів.
      </P>
      <P>
        Відвідування ми рахуємо за допомогою <B>Umami</B> — статистики з відкритим кодом, яка працює на нашому власному сервері
        (stats.aurasea.org) і нікому не передається. Вона фіксує сторінку, сайт чи застосунок, з якого ви перейшли (наприклад, Google чи
        Threads), країну, тип пристрою і браузер, а також дії, як-от відправлення анкети. Вона не використовує cookie, не зберігає вашу
        IP-адресу, не встановлює вашу особу й не стежить за вами на інших сайтах; відвідування рахуються за анонімним ідентифікатором,
        який регулярно змінюється. Ці дані потрібні, щоб розуміти, як нас знаходять, і покращувати сайт (наш законний інтерес, ст. 6(1)(f)
        GDPR). Якщо ви заблокуєте скрипт статистики в браузері, сайт працюватиме так само.
      </P>
      <P>
        Анкета зберігає незавершені відповіді в локальному сховищі вашого браузера — лише на вашому пристрої, щоб вони не загубилися, якщо ви
        закриєте сторінку. Після відправлення анкети вони видаляються; їх також можна очистити в налаштуваннях браузера. Так само запам’ятовується обрана мова (українська чи англійська), щоб не питати знову.
      </P>
      <P>Посилання на Telegram, Instagram, LinkedIn, Facebook і WhatsApp ведуть на ці сервіси, які мають власні політики конфіденційності.</P>

      {h(13)}
      <P>
        Наші послуги призначені для повнолітніх. Курсанти та інші кандидати, молодші за 18 років, мають зв’язатися з нами до подання анкети; ми
        попросимо згоду батьків чи опікунів, якщо цього вимагає закон.
      </P>

      {h(14)}
      <P>
        Ми оновлюємо політику, коли змінюється наша робота з персональними даними. Дата вгорі показує останню зміну. Про суттєві зміни ми
        повідомимо моряків, які є в нашій базі.
      </P>
    </>
  );
}

const SUMMARY: Record<Lang, string[]> = {
  en: [
    "We use your data to find you work at sea — nothing else. We do not sell it or use it for advertising.",
    "Your profile goes to a ship-owner only for a specific vacancy.",
    "A person reviews every application; AI only helps read CV files.",
    "No cookies or advertising trackers; anonymous visit statistics stay on our own server.",
    `Write to ${COMPANY.email} to see, correct or delete your data.`,
  ],
  uk: [
    "Ми використовуємо ваші дані, щоб знайти вам роботу в морі, — і більше ні для чого. Не продаємо їх і не використовуємо для реклами.",
    "Ваша анкета потрапляє до судновласника лише під конкретну вакансію.",
    "Кожну анкету перевіряє людина; штучний інтелект лише допомагає читати файли резюме.",
    "На сайті немає cookie і рекламних трекерів; анонімна статистика відвідувань — лише на нашому сервері.",
    `Напишіть на ${COMPANY.email}, щоб переглянути, виправити або видалити свої дані.`,
  ],
};

export default function Privacy() {
  const lang = useLang();
  usePageMeta(
    "/privacy",
    { en: "Privacy Policy", uk: "Політика конфіденційності" },
    {
      en: "How AURA SEA collects, uses and protects seafarers’ personal data: purposes, recipients, transfers abroad, retention and your rights.",
      uk: "Як AURA SEA збирає, використовує й захищає персональні дані моряків: цілі, отримувачі, передача за кордон, строки зберігання та ваші права.",
    }
  );
  const t = lang === "en";

  return (
    <div className="min-h-screen pb-16">
      <section className="maritime-gradient pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold mb-4" data-testid="heading-privacy">
            {t ? "Privacy Policy" : "Політика конфіденційності"}
          </h1>
          <p className="text-muted-foreground">
            {t ? "Effective from" : "Діє з"} {EFFECTIVE_DATE[lang]}
          </p>
        </div>
      </section>

      <section className="py-8 maritime-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-premium rounded-2xl border-2 border-border p-6 sm:p-10">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h2 className="font-headline text-lg font-medium text-foreground">{t ? "In short" : "Коротко"}</h2>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground font-light list-disc pl-5 marker:text-cyan-400">
                {SUMMARY[lang].map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>

            <nav aria-label={t ? "Contents" : "Зміст"} className="mb-4">
              <h2 className="font-headline text-lg font-medium text-foreground mb-3">{t ? "Contents" : "Зміст"}</h2>
              <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm list-decimal pl-5 marker:text-cyan-400">
                {SECTIONS[lang].map((x) => (
                  <li key={x.id}>
                    <a
                      href={`#${x.id}`}
                      onClick={(e) => {
                        // The site uses hash routing: scroll instead of changing the hash
                        e.preventDefault();
                        document.getElementById(x.id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-muted-foreground hover:text-cyan-400"
                    >
                      {x.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {t ? <English /> : <Ukrainian />}
          </div>
        </div>
      </section>
    </div>
  );
}
