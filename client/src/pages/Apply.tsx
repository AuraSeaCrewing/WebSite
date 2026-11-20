import { cloneElement, createContext, isValidElement, useContext, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle, Anchor, ArrowLeft, ArrowRight, CheckCircle, ChevronDown, ClipboardList, FileText, IdCard, Info, Loader2, MessageSquare, Pencil, Plus, Ship,
  Trash2, User, Phone, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CERTIFICATES, DOCUMENT_TYPES, EMPLOYMENT_STATUSES, ENGLISH_LEVELS, RANKS, VESSEL_TYPES } from "@/lib/application-options";
import { track } from "@/lib/analytics";
import { useLang, usePageMeta, useT } from "@/lib/i18n";
import heroImage from "@assets/stock_images/stormy_sea_2.webp";

// Seafarer application form in six steps. Submits straight into the AURA SEA CRM (POST /api/public/apply), where it
// becomes a draft for a recruiter to review. Field names must match `applicationSchema` in the CRM
// (lib/website/application.ts in AuraSeaCrewing/CRM-Aura-Sea).

const CRM_URL = (import.meta.env.VITE_CRM_URL as string | undefined) ?? "https://crm.aurasea.org";
const DRAFT_KEY = "aurasea-application-draft";
const STEP_KEY = "aurasea-application-step";

type Doc = { type: string; name: string; number: string; country: string; issueDate: string; expiry: string };
type Cert = { name: string; number: string; issuedBy: string; issueCountry: string; issueDate: string; expiry: string };
type Voyage = {
  vesselName: string; flag: string; vesselType: string; dwt: string; imo: string; engine: string; power: string;
  company: string; crewingAgency: string; rank: string; startDate: string; endDate: string;
};
type Relative = { fullName: string; relation: string; phone: string; address: string };

type Form = {
  person: { lastName: string; firstName: string; middleName: string; birthDate: string; birthPlace: string; citizenship: string; sex: string; maritalStatus: string };
  contacts: { phone: string; email: string; whatsapp: string; viber: string; telegram: string; address: string; nearestAirport: string };
  physical: { heightCm: string; weightKg: string; overallSize: string; shoeSize: string };
  work: {
    desiredRank: string; availableFrom: string; expectedSalary: string; englishLevel: string; employmentStatus: string; aboutMe: string;
    /** Wants a first contract in a higher rank ("в старт") — a consultation topic for the recruiter. */
    startPosition: boolean;
    /** Wants to move to another type of vessels — also a consultation topic. */
    fleetChange: boolean;
    fleetChangeTo: string;
  };
  documents: Doc[];
  certificates: Cert[];
  voyages: Voyage[];
  relatives: Relative[];
  consent: boolean;
};

const emptyDoc = (type: string): Doc => ({ type, name: "", number: "", country: "", issueDate: "", expiry: "" });
const emptyCert = (): Cert => ({ name: "", number: "", issuedBy: "", issueCountry: "", issueDate: "", expiry: "" });
const emptyVoyage = (): Voyage => ({
  vesselName: "", flag: "", vesselType: "", dwt: "", imo: "", engine: "", power: "", company: "", crewingAgency: "", rank: "", startDate: "", endDate: "",
});
const emptyRelative = (): Relative => ({ fullName: "", relation: "", phone: "", address: "" });

const emptyForm = (): Form => ({
  person: { lastName: "", firstName: "", middleName: "", birthDate: "", birthPlace: "", citizenship: "", sex: "", maritalStatus: "" },
  contacts: { phone: "", email: "", whatsapp: "", viber: "", telegram: "", address: "", nearestAirport: "" },
  physical: { heightCm: "", weightKg: "", overallSize: "", shoeSize: "" },
  work: {
    desiredRank: "", availableFrom: "", expectedSalary: "", englishLevel: "", employmentStatus: "", aboutMe: "",
    startPosition: false, fleetChange: false, fleetChangeTo: "",
  },
  documents: [emptyDoc("PASSPORT"), emptyDoc("SEAMANS_BOOK")],
  certificates: [emptyCert()],
  voyages: [emptyVoyage()],
  relatives: [emptyRelative()],
  consent: false,
});

function loadDraft(): Form {
  const base = emptyForm();
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<Form>;
      // Merge group by group: drafts saved by an older version of the form lack new fields
      return {
        ...base,
        ...d,
        person: { ...base.person, ...d.person },
        contacts: { ...base.contacts, ...d.contacts },
        physical: { ...base.physical, ...d.physical },
        work: { ...base.work, ...d.work },
        consent: false,
      };
    }
  } catch {
    /* storage unavailable: start empty */
  }
  return base;
}

function loadStep(): number {
  try {
    const n = Number(localStorage.getItem(STEP_KEY));
    return Number.isInteger(n) && n >= 0 && n < STEPS.length ? n : 0;
  } catch {
    return 0;
  }
}

const MAX = { documents: 10, certificates: 40, voyages: 30, relatives: 3 };

type Text = { en: string; uk: string };

/** The six steps: title, icon and the helper text shown at the top of the step. */
const STEPS: { title: Text; short: Text; icon: typeof User; intro: Text }[] = [
  {
    title: { en: "Personal details and contacts", uk: "Особисті дані та контакти" },
    short: { en: "Personal", uk: "Про вас" },
    icon: User,
    intro: {
      en: "Start with who you are and how to reach you. Write your name in Latin letters exactly as in your international passport — ship-owners check it against your documents. Only fields with * are required; the rest can be added later.",
      uk: "Почнімо з того, хто ви і як з вами зв’язатися. Ім’я та прізвище пишіть латиницею точно як у закордонному паспорті — судновласники звіряють їх із документами. Обов’язкові лише поля з *, решту можна додати пізніше.",
    },
  },
  {
    title: { en: "Position and availability", uk: "Посада та готовність" },
    short: { en: "Position", uk: "Посада" },
    icon: Anchor,
    intro: {
      en: "Tell us which position you are looking for and from when you are ready to join. If you are thinking about a promotion or a different type of vessels, tick it below — we will discuss it with you at a free consultation.",
      uk: "Вкажіть, яку посаду шукаєте і з якої дати готові до посадки. Якщо думаєте про підвищення або інший тип суден — позначте це нижче, ми обговоримо це з вами на безкоштовній консультації.",
    },
  },
  {
    title: { en: "Documents", uk: "Документи" },
    short: { en: "Documents", uk: "Документи" },
    icon: IdCard,
    intro: {
      en: "Your international passport and seaman’s book, and visas if you have them. Numbers and dates are enough — please do not upload scans here. We watch the validity dates and remind you in time to renew.",
      uk: "Закордонний паспорт і мореплавна книжка, а також візи, якщо є. Достатньо номерів і дат — скани тут не потрібні. Ми стежимо за строками дії й вчасно нагадаємо про продовження.",
    },
  },
  {
    title: { en: "Certificates", uk: "Сертифікати" },
    short: { en: "Certificates", uk: "Сертифікати" },
    icon: FileText,
    intro: {
      en: "Your Certificate of Competency (CoC) and endorsement, STCW courses and medical certificate. Start typing the name and pick it from the list. If a certificate has no expiry date, tick “Unlimited”.",
      uk: "Ваш диплом (CoC) і підтвердження до нього, курси STCW і медичний сертифікат. Почніть вводити назву й оберіть її зі списку. Якщо сертифікат безстроковий, позначте «Безстроковий».",
    },
  },
  {
    title: { en: "Sea service", uk: "Стаж у морі" },
    short: { en: "Sea service", uk: "Стаж" },
    icon: Ship,
    intro: {
      en: "Your contracts, starting with the most recent. The vessel name, type, your rank and dates matter most; add DWT, engine and ship-owner if you remember them. If you are on board now, leave “Sign off” empty.",
      uk: "Ваші контракти, починаючи з останнього. Найважливіше — назва й тип судна, ваша посада та дати; DWT, двигун і судновласника додайте, якщо пам’ятаєте. Якщо ви зараз на борту, залиште «Списання» порожнім.",
    },
  },
  {
    title: { en: "About you", uk: "Про себе" },
    short: { en: "Send", uk: "Надіслати" },
    icon: MessageSquare,
    intro: {
      en: "Anything else we should know — experience, wishes, questions. Then confirm your consent and send the application: it goes straight to our crewing team.",
      uk: "Що ще нам варто знати — досвід, побажання, запитання. Потім підтвердьте згоду й надішліть анкету: вона одразу потрапить до нашої команди.",
    },
  },
];

/** Section names for the server's list of invalid fields ("contacts.email", "voyages.2.vesselName") and the step to go back to. */
const SECTION_LABELS: Record<string, { en: string; uk: string; step: number }> = {
  person: { en: "Personal details", uk: "Особисті дані", step: 0 },
  contacts: { en: "Contacts", uk: "Контакти", step: 0 },
  physical: { en: "Physical details", uk: "Фізичні дані", step: 0 },
  relatives: { en: "Next of kin", uk: "Контактна особа", step: 0 },
  work: { en: "Position", uk: "Посада", step: 1 },
  documents: { en: "Documents", uk: "Документи", step: 2 },
  certificates: { en: "Certificates", uk: "Сертифікати", step: 3 },
  voyages: { en: "Sea service", uk: "Стаж у морі", step: 4 },
  consent: { en: "Consent", uk: "Згода", step: 5 },
};

// Large fields and text: the form is often filled in on a phone, sometimes from a ship.
// scroll-mt keeps a field clear of the sticky header when an error scrolls to it.
const selectClass =
  "flex h-12 w-full scroll-mt-32 rounded-lg border border-border bg-background/60 px-4 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-red-400";
const inputClass =
  "mt-1 h-12 scroll-mt-32 rounded-lg px-4 !text-base bg-background/60 border-border text-foreground placeholder:text-muted-foreground aria-[invalid=true]:border-red-400";

/** Errors of the current step by field path ("person.lastName", "voyages.0.endDate"), read by every Field. */
const ErrorsContext = createContext<Record<string, string>>({});

/**
 * One field: the label is tied to the control (htmlFor/id), the hint and the error are read out with it
 * (aria-describedby), and an error marks the control invalid. `name` is the field path used for errors.
 */
function Field({
  label, required, hint, name, className, children,
}: { label: string; required?: boolean; hint?: string; name?: string; className?: string; children: ReactNode }) {
  const id = useId();
  const error = useContext(ErrorsContext)[name ?? ""];
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        "data-field": name,
        "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })
    : children;
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-foreground text-base">
        {label}
        {required && (
          <span className="text-cyan-400" aria-hidden="true">
            {" "}*
          </span>
        )}
      </Label>
      <div className="mt-1">{control}</div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-1.5 text-sm text-muted-foreground font-light leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}

/** A block of fields. `bare` — the step has one block and its title is already in the step header. */
function Section({ icon: Icon, title, hint, bare, children }: { icon: typeof User; title: string; hint?: string; bare?: boolean; children: ReactNode }) {
  return (
    <section className="glass-card rounded-2xl p-5 sm:p-8 lg:p-10" aria-label={bare ? title : undefined}>
      {!bare && (
        <div className="flex items-center gap-3 mb-1">
          <Icon className="w-6 h-6 text-cyan-400" aria-hidden="true" />
          <h2 className="font-headline text-2xl font-medium text-foreground">{title}</h2>
        </div>
      )}
      {hint && <p className="text-base text-muted-foreground font-light mb-6 mt-1">{hint}</p>}
      <div className={cn(!hint && !bare && "mt-6")}>{children}</div>
    </section>
  );
}

/** Optional group inside a step: closed until opened, or open when something in it is already filled in. */
function Optional({ icon: Icon, title, hint, filled, children }: { icon: typeof User; title: string; hint: string; filled: boolean; children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(filled);
  const bodyId = useId();
  return (
    <section className="glass-card rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="w-full flex items-center gap-3 sm:gap-4 p-5 sm:p-8 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon className="w-6 h-6 text-cyan-400 flex-shrink-0" aria-hidden="true" />
        <span className="flex-1 min-w-0">
          <span className="block font-headline text-xl sm:text-2xl font-medium text-foreground">{title}</span>
          <span className="block text-sm sm:text-base text-muted-foreground font-light mt-0.5">{hint}</span>
        </span>
        <span className="hidden sm:inline text-sm text-cyan-300">{open ? t("Hide", "Згорнути") : t("Optional — open", "Необов’язково — відкрити")}</span>
        <ChevronDown className={cn("w-6 h-6 text-cyan-300 flex-shrink-0 transition-transform duration-300", open && "rotate-180")} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-8 lg:px-10 pb-6 sm:pb-10">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** "!" + text: something was typed but it is not a full valid date yet (the step shows an error). */
const isPartialDate = (v: string) => v.startsWith("!");
const isoToText = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split("-").reverse().join(".") : isPartialDate(v) ? v.slice(1) : "");

/**
 * Date typed as дд.мм.рррр with the dots added automatically — the same on every phone and browser
 * (a native date picker follows the browser language and is slow for a birth year). Stores yyyy-mm-dd.
 */
function DateInput({ value, onChange, disabled, ...rest }: { value: string; onChange: (v: string) => void; disabled?: boolean } & Record<string, unknown>) {
  const [text, setText] = useState(() => isoToText(value));
  useEffect(() => {
    // Value changed from outside (draft restored, "unlimited" ticked): show it
    if (!isPartialDate(value)) setText(isoToText(value));
  }, [value]);
  const handle = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const formatted = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join(".");
    setText(formatted);
    if (!digits) return onChange("");
    if (digits.length === 8) {
      const [d, m, y] = [Number(digits.slice(0, 2)), Number(digits.slice(2, 4)), Number(digits.slice(4))];
      const date = new Date(Date.UTC(y, m - 1, d));
      if (y >= 1900 && y <= 2100 && date.getUTCMonth() === m - 1 && date.getUTCDate() === d) {
        return onChange(`${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`);
      }
    }
    onChange("!" + formatted);
  };
  return (
    <Input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="дд.мм.рррр"
      maxLength={10}
      value={text}
      disabled={disabled}
      onChange={(e) => handle(e.target.value)}
      className={inputClass}
    />
  );
}

function ExpiryInput({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Record<string, unknown>) {
  const t = useT();
  const unlimited = value === "unlimited";
  return (
    <div className="space-y-1">
      <DateInput {...rest} value={unlimited ? "" : value} disabled={unlimited} onChange={onChange} />
      <label className="inline-flex items-center gap-2.5 min-h-[44px] text-sm text-muted-foreground font-light cursor-pointer">
        <input type="checkbox" checked={unlimited} onChange={(e) => onChange(e.target.checked ? "unlimited" : "")} className="accent-cyan-400 w-5 h-5" />
        {t("Unlimited", "Безстроковий")}
      </label>
    </div>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground hover:text-red-300 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Trash2 className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}

function AddButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={disabled} className="mt-4 h-11 text-base">
      <Plus className="w-5 h-5 mr-1.5" aria-hidden="true" /> {children}
    </Button>
  );
}

/** Tick box with an explanation under it (career wishes on step 2). */
function Choice({ checked, onChange, title, hint, testId }: { checked: boolean; onChange: (v: boolean) => void; title: string; hint: string; testId: string }) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
        checked ? "border-cyan-400/60 bg-cyan-500/10" : "border-border/60 hover:border-cyan-500/40"
      )}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-cyan-400 w-5 h-5 flex-shrink-0" data-testid={testId} />
      <span>
        <span className="block text-base text-foreground">{title}</span>
        <span className="block text-sm text-muted-foreground font-light mt-1 leading-snug">{hint}</span>
      </span>
    </label>
  );
}

/**
 * Sent: the circle and the tick draw themselves, then one ripple spreads out like a wake. Happens once per
 * application, so it can take a moment; with motion switched off it is simply the finished mark.
 */
function SuccessMark() {
  const reduce = useReducedMotion();
  const draw = (delay: number, duration: number) =>
    reduce ? { initial: false as const } : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { delay, duration, ease: [0.65, 0, 0.35, 1] as const } };
  return (
    <div className="relative mx-auto mb-5 w-20 h-20" aria-hidden="true">
      {!reduce &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border-2 border-emerald-400/60"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 2.4, opacity: [0, 0.7, 0] }}
            transition={{ delay: 0.9 + i * 0.25, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      <svg viewBox="0 0 80 80" className="relative w-20 h-20 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <motion.circle cx="40" cy="40" r="36" {...draw(0.1, 0.6)} />
        <motion.path d="M24 41 l11 11 l21 -23" {...draw(0.6, 0.4)} />
      </svg>
    </div>
  );
}

function Progress({ step, onPick }: { step: number; onPick: (n: number) => void }) {
  const lang = useLang();
  const t = useT();
  return (
    <nav aria-label={t("Application steps", "Кроки анкети")} className="mb-4 sm:mb-6">
      <ol className="flex items-stretch gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          const name = `${t("Step", "Крок")} ${i + 1}: ${s.title[lang]}`;
          return (
            <li key={i} className="flex-1 min-w-0">
              <button
                type="button"
                // Earlier steps can be reopened at any time; later ones only through "Next" (it checks the current step)
                onClick={() => i < step && onPick(i)}
                aria-disabled={i >= step}
                aria-current={current ? "step" : undefined}
                aria-label={done ? `${name} — ${t("done, open", "заповнено, відкрити")}` : name}
                className={cn(
                  "w-full min-h-[44px] flex flex-col justify-center text-left group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  done ? "cursor-pointer" : "cursor-default"
                )}
                data-testid={`apply-step-${i + 1}`}
              >
                <span className={cn("block h-2 rounded-full transition-colors duration-500", done ? "bg-cyan-400" : current ? "bg-cyan-300" : "bg-white/20")} />
                <span
                  className={cn(
                    "hidden sm:block mt-2 text-sm truncate",
                    current ? "text-white" : done ? "text-cyan-200 group-hover:underline" : "text-white/75"
                  )}
                  aria-hidden="true"
                >
                  {i + 1}. {s.short[lang]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type Errors = Record<string, string>;
type ListKey = "documents" | "certificates" | "voyages" | "relatives";
const TODAY = () => new Date().toISOString().slice(0, 10);
const isIso = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Checks of one step in the page language. Order of keys = order on the page (the first gets focus). */
function validateStep(step: number, f: Form, t: <T>(en: T, uk: T) => T): Errors {
  const e: Errors = {};
  const required = t("Required field", "Обов’язкове поле");
  const partial = t("Incomplete date — type it as dd.mm.yyyy", "Неповна дата — введіть у форматі дд.мм.рррр");
  const date = (key: string, v: string) => {
    if (isPartialDate(v)) e[key] = partial;
  };
  if (step === 0) {
    if (!f.person.lastName.trim()) e["person.lastName"] = required;
    if (!f.person.firstName.trim()) e["person.firstName"] = required;
    const b = f.person.birthDate;
    if (!b) e["person.birthDate"] = required;
    else if (isPartialDate(b)) e["person.birthDate"] = partial;
    else {
      const age = (Date.now() - Date.parse(b)) / (365.25 * 24 * 3600 * 1000);
      if (age < 16 || age > 80) e["person.birthDate"] = t("Check the year of birth", "Перевірте рік народження");
    }
    if (!f.person.citizenship.trim()) e["person.citizenship"] = required;
    const digits = f.contacts.phone.replace(/\D/g, "");
    if (!f.contacts.phone.trim()) e["contacts.phone"] = required;
    else if (digits.length < 7) e["contacts.phone"] = t("Phone number with country code, e.g. +380 67 123 45 67", "Номер із кодом країни, напр. +380 67 123 45 67");
    if (!f.contacts.email.trim()) e["contacts.email"] = required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.contacts.email.trim())) e["contacts.email"] = t("Check the email, e.g. name@gmail.com", "Перевірте email, напр. name@gmail.com");
  }
  if (step === 1) {
    if (!f.work.desiredRank.trim()) e["work.desiredRank"] = required;
    date("work.availableFrom", f.work.availableFrom);
  }
  const rows = (list: "documents" | "certificates", items: { issueDate: string; expiry: string }[]) =>
    items.forEach((it, i) => {
      date(`${list}.${i}.issueDate`, it.issueDate);
      date(`${list}.${i}.expiry`, it.expiry);
      if (isIso(it.issueDate) && isIso(it.expiry) && it.expiry < it.issueDate)
        e[`${list}.${i}.expiry`] = t("Valid-until date is before the issue date", "Дата «дійсний до» раніша за дату видачі");
      if (isIso(it.issueDate) && it.issueDate > TODAY()) e[`${list}.${i}.issueDate`] = t("Issue date is in the future", "Дата видачі ще не настала");
    });
  if (step === 2) rows("documents", f.documents);
  if (step === 3) rows("certificates", f.certificates);
  if (step === 4)
    f.voyages.forEach((v, i) => {
      date(`voyages.${i}.startDate`, v.startDate);
      date(`voyages.${i}.endDate`, v.endDate);
      if (isIso(v.startDate) && v.startDate > TODAY()) e[`voyages.${i}.startDate`] = t("Sign-on date is in the future", "Дата посадки ще не настала");
      if (isIso(v.startDate) && isIso(v.endDate) && v.endDate < v.startDate)
        e[`voyages.${i}.endDate`] = t("Sign-off is before sign-on", "Списання раніше за посадку");
    });
  return e;
}

/** Field names for the error summary at the top of a step. */
const FIELD_NAMES: Record<string, Text> = {
  lastName: { en: "Last name", uk: "Прізвище" },
  firstName: { en: "First name", uk: "Ім’я" },
  birthDate: { en: "Date of birth", uk: "Дата народження" },
  citizenship: { en: "Citizenship", uk: "Громадянство" },
  phone: { en: "Phone", uk: "Телефон" },
  email: { en: "Email", uk: "Email" },
  desiredRank: { en: "Position applied for", uk: "Бажана посада" },
  availableFrom: { en: "Ready to start from", uk: "Готовий з" },
  issueDate: { en: "Issued", uk: "Виданий" },
  expiry: { en: "Valid until", uk: "Дійсний до" },
  startDate: { en: "Sign on", uk: "Посадка" },
  endDate: { en: "Sign off", uk: "Списання" },
};

export default function Apply() {
  const t = useT();
  const lang = useLang();
  usePageMeta(
    "/apply",
    { en: "Seafarer Application Form", uk: "Анкета моряка" },
    {
      en: "Apply to AURA SEA online in six short steps: your details, position, documents, certificates and sea service go straight to our crewing team.",
      uk: "Подайте анкету в AURA SEA онлайн за шість коротких кроків: дані, посада, документи, сертифікати й стаж — одразу до нашої команди.",
    }
  );
  const [form, setForm] = useState<Form>(loadDraft);
  const [step, setStep] = useState<number>(loadStep);
  /** +1 going forward, -1 going back: the new step slides in from the side you are moving to. */
  const direction = useRef(1);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  /** The row just removed, for "Undo" (default passport and seaman's book rows are easy to delete by mistake). */
  const [removed, setRemoved] = useState<{ list: ListKey; index: number; item: unknown } | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Long form: keep answers and the current step in this browser until it is sent
  useEffect(() => {
    if (status === "done") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, consent: false }));
      localStorage.setItem(STEP_KEY, String(step));
    } catch {
      /* storage unavailable */
    }
  }, [form, step, status]);

  // Statistics: how far people get through the form (Umami, no personal data)
  useEffect(() => {
    track(`application-step-${step + 1}`);
  }, [step]);

  // Fixing a field removes its error at once
  const clearError = (path: string) =>
    setErrors((e) => {
      if (!(path in e)) return e;
      const rest = { ...e };
      delete rest[path];
      return rest;
    });
  const set = <K extends "person" | "contacts" | "physical">(group: K, key: keyof Form[K], value: string) => {
    clearError(`${group}.${String(key)}`);
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  };
  const setWork = <K extends keyof Form["work"]>(key: K, value: Form["work"][K]) => {
    clearError(`work.${String(key)}`);
    setForm((f) => ({ ...f, work: { ...f.work, [key]: value } }));
  };

  const setItem = <K extends ListKey>(list: K, i: number, key: keyof Form[K][number], value: string) => {
    clearError(`${list}.${i}.${String(key)}`);
    setForm((f) => ({ ...f, [list]: f[list].map((it, j) => (j === i ? { ...it, [key]: value } : it)) }));
  };
  const addItem = <K extends ListKey>(list: K, item: Form[K][number]) => setForm((f) => ({ ...f, [list]: [...f[list], item] }));
  const removeItem = (list: ListKey, i: number) => {
    setRemoved({ list, index: i, item: form[list][i] });
    setErrors({});
    setForm((f) => ({ ...f, [list]: f[list].filter((_, j) => j !== i) }));
  };
  const undoRemove = () => {
    if (!removed) return;
    const { list, index, item } = removed;
    setForm((f) => {
      const items = [...f[list]] as unknown[];
      items.splice(index, 0, item);
      return { ...f, [list]: items };
    });
    setRemoved(null);
  };
  useEffect(() => {
    if (!removed) return;
    const timer = setTimeout(() => setRemoved(null), 8000);
    return () => clearTimeout(timer);
  }, [removed]);

  const goTo = (n: number) => {
    direction.current = n >= step ? 1 : -1;
    setError(null);
    setErrors({});
    setStep(n);
    // The step changes in place: bring its top into view
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  /** Show the step's errors: a summary at the top and the first wrong field focused (clear of the sticky header). */
  const showErrors = (found: Errors) => {
    setErrors(found);
    setTimeout(() => {
      const first = Object.keys(found)[0];
      const el = first ? (document.querySelector(`[data-field="${first}"]`) as HTMLElement | null) : null;
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  };

  /** Next: checks only the current step, in the page language (no browser bubbles). */
  const next = () => {
    const found = validateStep(step, form, t);
    if (Object.keys(found).length) return showErrors(found);
    goTo(Math.min(step + 1, STEPS.length - 1));
  };

  const showError = (text: string) => {
    setError(text);
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Enter in a field of an earlier step means "next", not "send"
    if (step < STEPS.length - 1) return next();
    if (status === "sending") return;
    setError(null);
    // Every step once more (a draft from an older version of the form may hold a wrong value)
    for (let n = 0; n < STEPS.length - 1; n++) {
      const found = validateStep(n, form, t);
      if (Object.keys(found).length) {
        goTo(n);
        return setTimeout(() => showErrors(found), 60);
      }
    }
    if (!form.consent) return showError(t("Please confirm your consent to the processing of personal data.", "Підтвердьте, будь ласка, згоду на обробку персональних даних."));

    // Empty optional rows are not sent: the CRM requires a name in each row that is sent
    const payload = {
      ...form,
      work: { ...form.work, fleetChangeTo: form.work.fleetChange ? form.work.fleetChangeTo : "" },
      certificates: form.certificates.filter((c) => c.name.trim()),
      voyages: form.voyages.filter((v) => v.vesselName.trim()),
      relatives: form.relatives.filter((r) => r.fullName.trim()),
      documents: form.documents.filter((d) => d.number.trim() || d.issueDate || d.expiry),
      website: honeypot,
    };

    setStatus("sending");
    try {
      const res = await fetch(`${CRM_URL}/api/public/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("done");
        track("application-sent");
        try {
          localStorage.removeItem(DRAFT_KEY);
          localStorage.removeItem(STEP_KEY);
        } catch {
          /* storage unavailable */
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string; fields?: string[] };
      setStatus("idle");
      if (res.status === 422 && body.fields?.length) {
        // The server names the fields ("contacts.email"): open the first step that has one and mark them there
        const steps = body.fields.map((f) => SECTION_LABELS[f.split(".")[0]]?.step).filter((n): n is number => n !== undefined);
        if (steps.length) {
          const target = Math.min(...steps);
          const found: Errors = {};
          for (const f of body.fields) if (SECTION_LABELS[f.split(".")[0]]?.step === target) found[f] = t("Check this field", "Перевірте це поле");
          goTo(target);
          setTimeout(() => showErrors(found), 60);
          return;
        }
        return showError(t("Please check the form and try again.", "Перевірте, будь ласка, анкету й спробуйте ще раз."));
      }
      if (res.status === 429) return showError(t("Too many applications were sent from your network. Please try again in an hour.", "З вашої мережі надіслано забагато анкет. Спробуйте, будь ласка, за годину."));
      return showError(t("We could not send your application. Please try again or email it to crewing@aurasea.org.", "Не вдалося надіслати анкету. Спробуйте ще раз або надішліть її на crewing@aurasea.org."));
    } catch {
      setStatus("idle");
      showError(t("No connection to the server. Please check your internet and try again — your answers are saved in this browser.", "Немає зв’язку з сервером. Перевірте інтернет і спробуйте ще раз — ваші відповіді збережено в цьому браузері."));
    }
  };

  if (status === "done") {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="fixed inset-0 bg-black/50 z-0" />
        <section className="relative z-10 pt-40 pb-24 px-4">
          <div className="glass-card rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto" data-testid="application-success">
            <div className="text-center">
              <SuccessMark />
              <h1 className="font-headline text-3xl sm:text-4xl font-semibold mb-3 text-foreground">{t("Application received", "Анкету отримано")}</h1>
              <p className="text-base sm:text-lg text-foreground/85 font-light">
                {t(`Thank you, ${form.person.firstName}! Your application is already with our crewing team.`, `Дякуємо, ${form.person.firstName}! Ваша анкета вже в нашої команди.`)}
              </p>
            </div>
            <h2 className="font-headline text-xl font-medium text-foreground mt-8 mb-3">{t("What happens next", "Що далі")}</h2>
            <ol className="space-y-3 text-base text-foreground/90 list-decimal pl-6 marker:text-cyan-300">
              <li>{t("A recruiter checks your application and documents.", "Рекрутер перегляне вашу анкету й документи.")}</li>
              <li>{t("When there is a suitable position, we call or write to you on the phone, WhatsApp or Telegram you gave.", "Коли буде відповідна посада, ми зателефонуємо або напишемо на вказаний телефон, у WhatsApp чи Telegram.")}</li>
              <li>{t("If you asked for a consultation on promotion or a fleet change, we will discuss it in the same call.", "Якщо ви просили консультацію щодо підвищення чи зміни флоту, обговоримо це під час дзвінка.")}</li>
            </ol>
            <p className="mt-6 text-base text-foreground/90">
              {t("Questions? Write to us:", "Є запитання? Напишіть нам:")}{" "}
              <a href="https://wa.me/380978458147" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">WhatsApp</a>
              {" · "}
              <a href="https://t.me/AURASEA_crew" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">Telegram</a>
              {" · "}
              <a href="mailto:crewing@aurasea.org" className="text-cyan-300 hover:underline">crewing@aurasea.org</a>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("The answers saved in this browser have been deleted.", "Відповіді, збережені в цьому браузері, видалено.")}
            </p>
            <div className="mt-8 text-center">
              <Link href="/vacancies" className="text-cyan-300 hover:underline text-base">
                {t("See current vacancies", "Переглянути актуальні вакансії")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const { person, contacts, physical, work } = form;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <ErrorsContext.Provider value={errors}>
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="fixed inset-0 bg-black/50 z-0" />

      <section className="pt-24 pb-3 sm:pt-32 sm:pb-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="font-headline text-3xl sm:text-5xl font-bold mb-2 sm:mb-6 text-white drop-shadow-md" data-testid="heading-apply">
            {t("Seafarer Application Form", "Анкета моряка")}
          </h1>
          <p className="hidden sm:block text-lg text-white drop-shadow-md font-light">
            {t(
              "Six short steps, about 10 minutes. Answers are saved in this browser — you can stop and come back.",
              "Шість коротких кроків, близько 10 хвилин. Відповіді зберігаються в цьому браузері — можна повернутися пізніше."
            )}
          </p>
        </motion.div>
      </section>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="relative z-10 w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-10 pb-24 space-y-4 sm:space-y-6">
        {/* Hidden from people; bots fill it in */}
        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
          </label>
        </div>

        <div ref={topRef} className="scroll-mt-24">
          <Progress step={step} onPick={goTo} />
          <div className="glass-card rounded-2xl p-4 sm:p-8 flex gap-3 sm:gap-6" data-testid="apply-step-intro">
            <current.icon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm sm:text-base tracking-wide text-cyan-300 mb-1">
                {t(`Step ${step + 1} of ${STEPS.length}`, `Крок ${step + 1} з ${STEPS.length}`)}
              </p>
              <h2 className="font-headline text-xl sm:text-3xl font-semibold text-foreground mb-2 sm:mb-3">{current.title[lang]}</h2>
              <p className="text-base sm:text-lg text-foreground/85 font-light leading-relaxed max-w-5xl">{current.intro[lang]}</p>
            </div>
          </div>
        </div>

        <datalist id="ranks">{RANKS.map((r) => <option key={r} value={r} />)}</datalist>
        <datalist id="vessel-types">{VESSEL_TYPES.map((r) => <option key={r} value={r} />)}</datalist>
        <datalist id="certificates">{CERTIFICATES.map((r) => <option key={r} value={r} />)}</datalist>

        {Object.keys(errors).length > 0 && (
          <div ref={summaryRef} role="alert" className="scroll-mt-32 rounded-2xl border border-red-400/50 bg-red-950/60 backdrop-blur-md p-5 sm:p-6" data-testid="apply-error-summary">
            <p className="flex items-center gap-2 text-base sm:text-lg font-medium text-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {Object.keys(errors).length === 1
                ? t("Please check one field before going on:", "Перевірте, будь ласка, одне поле, щоб продовжити:")
                : t(`Please check ${Object.keys(errors).length} fields before going on:`, `Перевірте, будь ласка, поля (${Object.keys(errors).length}), щоб продовжити:`)}
            </p>
            <ul className="mt-3 space-y-1">
              {Object.entries(errors).map(([path, message]) => {
                const parts = path.split(".");
                const name = FIELD_NAMES[parts[parts.length - 1]];
                const row = parts.length === 3 ? ` (${Number(parts[1]) + 1})` : "";
                return (
                  <li key={path}>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.querySelector(`[data-field="${path}"]`) as HTMLElement | null;
                        el?.focus({ preventScroll: true });
                        el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="text-left text-base text-red-100 underline decoration-red-300/60 underline-offset-4 hover:decoration-red-100 min-h-[36px]"
                    >
                      {(name ? name[lang] : path) + row}: {message}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 32 * direction.current }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4 sm:space-y-6"
        >
          {step === 0 && (
            <>
              <Section icon={User} title={t("Personal details", "Особисті дані")}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field name="person.lastName" label={t("Last name", "Прізвище")} required hint={t("In Latin letters, as in your passport", "Латиницею, як у паспорті")}>
                    <Input required value={person.lastName} onChange={(e) => set("person", "lastName", e.target.value)} className={inputClass} autoComplete="family-name" />
                  </Field>
                  <Field name="person.firstName" label={t("First name", "Ім’я")} required hint={t("In Latin letters, as in your passport", "Латиницею, як у паспорті")}>
                    <Input required value={person.firstName} onChange={(e) => set("person", "firstName", e.target.value)} className={inputClass} autoComplete="given-name" />
                  </Field>
                  <Field label={t("Middle name", "По батькові")}>
                    <Input value={person.middleName} onChange={(e) => set("person", "middleName", e.target.value)} className={inputClass} autoComplete="additional-name" />
                  </Field>
                  <Field name="person.birthDate" label={t("Date of birth", "Дата народження")} required hint={t("e.g. 21.07.1988", "напр. 21.07.1988")}>
                    <DateInput value={person.birthDate} onChange={(v) => set("person", "birthDate", v)} />
                  </Field>
                  <Field label={t("Place of birth", "Місце народження")}>
                    <Input value={person.birthPlace} onChange={(e) => set("person", "birthPlace", e.target.value)} className={inputClass} />
                  </Field>
                  <Field name="person.citizenship" label={t("Citizenship", "Громадянство")} required>
                    <Input required value={person.citizenship} onChange={(e) => set("person", "citizenship", e.target.value)} className={inputClass} placeholder={t("e.g. Ukraine", "напр. Україна")} autoComplete="country-name" />
                  </Field>
                  <Field label={t("Sex", "Стать")}>
                    <select value={person.sex} onChange={(e) => set("person", "sex", e.target.value)} className={selectClass}>
                      <option value="">—</option>
                      <option value="M">{t("Male", "Чоловіча")}</option>
                      <option value="F">{t("Female", "Жіноча")}</option>
                    </select>
                  </Field>
                  <Field label={t("Marital status", "Сімейний стан")}>
                    <select value={person.maritalStatus} onChange={(e) => set("person", "maritalStatus", e.target.value)} className={selectClass}>
                      <option value="">—</option>
                      {[
                        ["Single", "Неодружений / неодружена"],
                        ["Married", "Одружений / заміжня"],
                        ["Divorced", "Розлучений / розлучена"],
                        ["Widowed", "Вдівець / вдова"],
                      ].map(([value, uk]) => (
                        <option key={value} value={value}>
                          {t(value, uk)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Section>

              <Section icon={Phone} title={t("Contacts", "Контакти")} hint={t("We will call or write to you about vacancies.", "Ми зателефонуємо чи напишемо вам щодо вакансій.")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field name="contacts.phone" label={t("Phone (with country code)", "Телефон (з кодом країни)")} required>
                    <Input type="tel" required minLength={5} value={contacts.phone} onChange={(e) => set("contacts", "phone", e.target.value)} className={inputClass} placeholder="+380 …" autoComplete="tel" />
                  </Field>
                  <Field name="contacts.email" label="Email" required>
                    <Input type="email" required value={contacts.email} onChange={(e) => set("contacts", "email", e.target.value)} className={inputClass} autoComplete="email" />
                  </Field>
                </div>
              </Section>

              <Optional
                icon={Phone}
                title={t("More ways to reach you", "Додаткові контакти")}
                hint={t("WhatsApp, Telegram, Viber, nearest airport, home address", "WhatsApp, Telegram, Viber, найближчий аеропорт, домашня адреса")}
                filled={Boolean(contacts.whatsapp || contacts.telegram || contacts.viber || contacts.nearestAirport || contacts.address)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="WhatsApp" hint={t("If different from your phone", "Якщо відрізняється від телефону")}>
                    <Input type="tel" value={contacts.whatsapp} onChange={(e) => set("contacts", "whatsapp", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Telegram">
                    <Input value={contacts.telegram} onChange={(e) => set("contacts", "telegram", e.target.value)} className={inputClass} placeholder={t("@username or phone", "@username або телефон")} />
                  </Field>
                  <Field label="Viber">
                    <Input type="tel" value={contacts.viber} onChange={(e) => set("contacts", "viber", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Nearest airport", "Найближчий аеропорт")} hint={t("We book your flight to the vessel from here", "Звідси бронюємо переліт до судна")}>
                    <Input value={contacts.nearestAirport} onChange={(e) => set("contacts", "nearestAirport", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Home address", "Домашня адреса")} className="sm:col-span-2">
                    <Input value={contacts.address} onChange={(e) => set("contacts", "address", e.target.value)} className={inputClass} autoComplete="street-address" />
                  </Field>
                </div>
              </Optional>

              <Optional
                icon={ClipboardList}
                title={t("Physical details", "Фізичні дані")}
                hint={t("Height and sizes — needed to order overalls and safety shoes for you on board", "Зріст і розміри — щоб замовити для вас комбінезон і захисне взуття на судно")}
                filled={Boolean(physical.heightCm || physical.weightKg || physical.overallSize || physical.shoeSize)}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <Field label={t("Height, cm", "Зріст, см")}>
                    <Input inputMode="numeric" value={physical.heightCm} onChange={(e) => set("physical", "heightCm", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Weight, kg", "Вага, кг")}>
                    <Input inputMode="numeric" value={physical.weightKg} onChange={(e) => set("physical", "weightKg", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Overall size", "Розмір комбінезона")}>
                    <Input value={physical.overallSize} onChange={(e) => set("physical", "overallSize", e.target.value)} className={inputClass} placeholder={t("e.g. 52 / L", "напр. 52 / L")} />
                  </Field>
                  <Field label={t("Shoe size", "Розмір взуття")}>
                    <Input value={physical.shoeSize} onChange={(e) => set("physical", "shoeSize", e.target.value)} className={inputClass} placeholder={t("e.g. 43", "напр. 43")} />
                  </Field>
                </div>
              </Optional>

              <Optional
                icon={Users}
                title={t("Next of kin", "Контактна особа")}
                hint={t("Who we contact if something happens to you at sea — usually a spouse or parent", "Кому ми зателефонуємо, якщо з вами щось трапиться в морі, — зазвичай дружина, чоловік чи батьки")}
                filled={form.relatives.some((r) => r.fullName || r.phone)}
              >
                <div className="space-y-4">
                  {form.relatives.map((r, i) => (
                    <div key={i} className="rounded-xl border border-border/60 p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-start">
                        <Field label={t("Full name", "Ім’я та прізвище")}>
                          <Input value={r.fullName} onChange={(e) => setItem("relatives", i, "fullName", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label={t("Relation", "Ким доводиться")}>
                          <Input value={r.relation} onChange={(e) => setItem("relatives", i, "relation", e.target.value)} className={inputClass} placeholder={t("e.g. wife, mother", "напр. дружина, мати")} />
                        </Field>
                        <Field label={t("Phone", "Телефон")}>
                          <Input type="tel" value={r.phone} onChange={(e) => setItem("relatives", i, "phone", e.target.value)} className={inputClass} />
                        </Field>
                      </div>
                      {form.relatives.length > 1 && (
                        <div className="flex justify-end">
                          <RemoveButton onClick={() => removeItem("relatives", i)} label={t("Remove contact", "Видалити контакт")} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <AddButton onClick={() => addItem("relatives", emptyRelative())} disabled={form.relatives.length >= MAX.relatives}>
                  {t("Add contact", "Додати контакт")}
                </AddButton>
              </Optional>
            </>
          )}

          {step === 1 && (
            <Section bare icon={Anchor} title={t("Position and availability", "Посада та готовність")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field name="work.desiredRank" label={t("Position applied for", "Бажана посада")} required hint={t("Start typing and pick from the list", "Почніть вводити й оберіть зі списку")}>
                  <Input required list="ranks" value={work.desiredRank} onChange={(e) => setWork("desiredRank", e.target.value)} className={inputClass} placeholder={t("e.g. 2nd Officer", "напр. 2nd Officer")} />
                </Field>
                <Field name="work.availableFrom" label={t("Ready to start from", "Готовий з")} hint={t("The date you can join a vessel", "Дата, з якої можете сісти на судно")}>
                  <DateInput value={work.availableFrom} onChange={(v) => setWork("availableFrom", v)} />
                </Field>
                <Field label={t("Current status", "Поточний статус")}>
                  <select value={work.employmentStatus} onChange={(e) => setWork("employmentStatus", e.target.value)} className={selectClass}>
                    <option value="">—</option>
                    {EMPLOYMENT_STATUSES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {t(o.value, o.uk)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("Level of English", "Рівень англійської")}>
                  <select value={work.englishLevel} onChange={(e) => setWork("englishLevel", e.target.value)} className={selectClass}>
                    <option value="">—</option>
                    {ENGLISH_LEVELS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {t(o.value, o.uk)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("Expected salary", "Очікувана зарплата")} hint={t("Per month, with currency", "На місяць, з валютою")}>
                  <Input value={work.expectedSalary} onChange={(e) => setWork("expectedSalary", e.target.value)} className={inputClass} placeholder={t("e.g. 6500 USD", "напр. 6500 USD")} />
                </Field>
              </div>

              <div className="mt-8">
                <h3 className="font-headline text-xl font-medium text-foreground mb-2">{t("Career plans", "Кар’єрні плани")}</h3>
                <p className="text-base text-muted-foreground font-light mb-4 flex items-start gap-2">
                  <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  {t(
                    "Optional. Tick what interests you — a recruiter will contact you for a free consultation on what is needed.",
                    "Необов’язково. Позначте, що вас цікавить, — рекрутер зв’яжеться з вами для безкоштовної консультації щодо того, що для цього потрібно."
                  )}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Choice
                    checked={work.startPosition}
                    onChange={(v) => setWork("startPosition", v)}
                    title={t("I want a start position (first contract in a higher rank)", "Бажаю позицію в старт (перший контракт на вищій посаді)")}
                    hint={t(
                      "For example, a 3rd Officer ready to start as 2nd Officer. We will check your diploma and sea service for promotion.",
                      "Наприклад, третій помічник, готовий стартувати другим. Ми перевіримо диплом і стаж для підвищення."
                    )}
                    testId="checkbox-start-position"
                  />
                  <div className="space-y-3">
                    <Choice
                      checked={work.fleetChange}
                      onChange={(v) => setWork("fleetChange", v)}
                      title={t("I want to change the type of fleet", "Бажаю змінити тип флоту")}
                      hint={t(
                        "For example, from bulk carriers to tankers. We will tell you which courses and documents are required.",
                        "Наприклад, з балкерів на танкери. Ми підкажемо, які курси й документи для цього потрібні."
                      )}
                      testId="checkbox-fleet-change"
                    />
                    <AnimatePresence initial={false}>
                      {work.fleetChange && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <Field label={t("Which type of vessels?", "На який тип суден?")}>
                            <Input list="vessel-types" value={work.fleetChangeTo} onChange={(e) => setWork("fleetChangeTo", e.target.value)} className={inputClass} placeholder={t("e.g. Oil tanker", "напр. Oil tanker")} />
                          </Field>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {step === 2 && (
            <Section bare icon={IdCard} title={t("Documents", "Документи")}>
              <div className="space-y-4">
                {form.documents.map((d, i) => (
                  <div key={i} className="rounded-xl border border-border/60 p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-5 items-start">
                      <Field label={t("Document", "Документ")} className="sm:col-span-2">
                        <select value={d.type} onChange={(e) => setItem("documents", i, "type", e.target.value)} className={selectClass}>
                          {DOCUMENT_TYPES.map((dt) => (
                            <option key={dt.value} value={dt.value}>
                              {t(dt.label, dt.uk)}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={t("Number", "Номер")} className="sm:col-span-2">
                        <Input value={d.number} onChange={(e) => setItem("documents", i, "number", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Country", "Країна")} className="sm:col-span-2">
                        <Input value={d.country} onChange={(e) => setItem("documents", i, "country", e.target.value)} className={inputClass} />
                      </Field>
                      {(d.type === "VISA" || d.type === "OTHER") && (
                        <Field label={t("Name / type", "Назва / вид")} className="sm:col-span-2">
                          <Input value={d.name} onChange={(e) => setItem("documents", i, "name", e.target.value)} className={inputClass} placeholder={d.type === "VISA" ? t("e.g. Schengen, US C1/D", "напр. Шенген, US C1/D") : ""} />
                        </Field>
                      )}
                      <Field name={`documents.${i}.issueDate`} label={t("Issued", "Виданий")} className="sm:col-span-2">
                        <DateInput value={d.issueDate} onChange={(v) => setItem("documents", i, "issueDate", v)} />
                      </Field>
                      <Field name={`documents.${i}.expiry`} label={t("Valid until", "Дійсний до")} className="sm:col-span-2">
                        <ExpiryInput value={d.expiry} onChange={(v) => setItem("documents", i, "expiry", v)} />
                      </Field>
                    </div>
                    <div className="flex justify-end">
                      <RemoveButton onClick={() => removeItem("documents", i)} label={t("Remove document", "Видалити документ")} />
                    </div>
                  </div>
                ))}
              </div>
              <AddButton onClick={() => addItem("documents", emptyDoc("VISA"))} disabled={form.documents.length >= MAX.documents}>
                {t("Add document", "Додати документ")}
              </AddButton>
            </Section>
          )}

          {step === 3 && (
            <Section bare icon={FileText} title={t("Certificates", "Сертифікати")}>
              <div className="space-y-4">
                {form.certificates.map((c, i) => (
                  <div key={i} className="rounded-xl border border-border/60 p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-5 items-start">
                      <Field label={t("Certificate", "Сертифікат")} className="sm:col-span-3">
                        <Input list="certificates" value={c.name} onChange={(e) => setItem("certificates", i, "name", e.target.value)} className={inputClass} placeholder={t("Start typing, e.g. Basic Safety Training", "Почніть вводити, напр. Basic Safety Training")} />
                      </Field>
                      <Field label={t("Number", "Номер")} className="sm:col-span-3">
                        <Input value={c.number} onChange={(e) => setItem("certificates", i, "number", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Issued by", "Ким виданий")} className="sm:col-span-2">
                        <Input value={c.issuedBy} onChange={(e) => setItem("certificates", i, "issuedBy", e.target.value)} className={inputClass} placeholder={t("Training centre or authority", "Навчальний центр або орган")} />
                      </Field>
                      <Field name={`certificates.${i}.issueDate`} label={t("Issued", "Виданий")} className="sm:col-span-2">
                        <DateInput value={c.issueDate} onChange={(v) => setItem("certificates", i, "issueDate", v)} />
                      </Field>
                      <Field name={`certificates.${i}.expiry`} label={t("Valid until", "Дійсний до")} className="sm:col-span-2">
                        <ExpiryInput value={c.expiry} onChange={(v) => setItem("certificates", i, "expiry", v)} />
                      </Field>
                    </div>
                    <div className="flex justify-end">
                      <RemoveButton onClick={() => removeItem("certificates", i)} label={t("Remove certificate", "Видалити сертифікат")} />
                    </div>
                  </div>
                ))}
              </div>
              <AddButton onClick={() => addItem("certificates", emptyCert())} disabled={form.certificates.length >= MAX.certificates}>
                {t("Add certificate", "Додати сертифікат")}
              </AddButton>
            </Section>
          )}

          {step === 4 && (
            <Section bare icon={Ship} title={t("Sea service", "Стаж у морі")}>
              <div className="space-y-4">
                {form.voyages.map((v, i) => (
                  <div key={i} className="rounded-xl border border-border/60 p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-5 items-start">
                      <Field label={t("Vessel name", "Назва судна")} className="sm:col-span-2">
                        <Input value={v.vesselName} onChange={(e) => setItem("voyages", i, "vesselName", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Vessel type", "Тип судна")} className="sm:col-span-2">
                        <Input list="vessel-types" value={v.vesselType} onChange={(e) => setItem("voyages", i, "vesselType", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Rank", "Посада")} className="sm:col-span-2">
                        <Input list="ranks" value={v.rank} onChange={(e) => setItem("voyages", i, "rank", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Flag", "Прапор")} className="sm:col-span-2">
                        <Input value={v.flag} onChange={(e) => setItem("voyages", i, "flag", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label="DWT">
                        <Input inputMode="numeric" value={v.dwt} onChange={(e) => setItem("voyages", i, "dwt", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label="IMO">
                        <Input inputMode="numeric" value={v.imo} onChange={(e) => setItem("voyages", i, "imo", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Main engine", "Головний двигун")} className="sm:col-span-2">
                        <Input value={v.engine} onChange={(e) => setItem("voyages", i, "engine", e.target.value)} className={inputClass} placeholder={t("e.g. MAN B&W", "напр. MAN B&W")} />
                      </Field>
                      <Field label={t("Power", "Потужність")} className="sm:col-span-2">
                        <Input value={v.power} onChange={(e) => setItem("voyages", i, "power", e.target.value)} className={inputClass} placeholder={t("e.g. 9480 kW", "напр. 9480 kW")} />
                      </Field>
                      <Field label={t("Ship-owner / manager", "Судновласник / менеджер")} className="sm:col-span-2">
                        <Input value={v.company} onChange={(e) => setItem("voyages", i, "company", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Crewing agency", "Крюїнгова агенція")} className="sm:col-span-2">
                        <Input value={v.crewingAgency} onChange={(e) => setItem("voyages", i, "crewingAgency", e.target.value)} className={inputClass} />
                      </Field>
                      <Field name={`voyages.${i}.startDate`} label={t("Sign on", "Посадка")} className="sm:col-span-3">
                        <DateInput value={v.startDate} onChange={(v) => setItem("voyages", i, "startDate", v)} />
                      </Field>
                      <Field name={`voyages.${i}.endDate`} label={t("Sign off", "Списання")} className="sm:col-span-3" hint={t("Empty if you are on board now", "Порожньо, якщо ви зараз на борту")}>
                        <DateInput value={v.endDate} onChange={(v) => setItem("voyages", i, "endDate", v)} />
                      </Field>
                    </div>
                    <div className="flex justify-end">
                      <RemoveButton onClick={() => removeItem("voyages", i)} label={t("Remove contract", "Видалити контракт")} />
                    </div>
                  </div>
                ))}
              </div>
              <AddButton onClick={() => addItem("voyages", emptyVoyage())} disabled={form.voyages.length >= MAX.voyages}>
                {t("Add contract", "Додати контракт")}
              </AddButton>
            </Section>
          )}

          {step === 5 && (
            <>
              <Section icon={CheckCircle} title={t("Check before sending", "Перевірте перед відправленням")} hint={t("This is what goes to our crewing team. Tap “Change” to fix anything.", "Ось що отримає наша команда. Натисніть «Змінити», щоб щось виправити.")}>
                <dl className="divide-y divide-white/10 rounded-xl bg-background/30" data-testid="apply-review">
                  {[
                    { label: t("Name", "Ім’я"), value: `${person.lastName} ${person.firstName}`.trim(), step: 0 },
                    { label: t("Phone", "Телефон"), value: contacts.phone, step: 0 },
                    { label: "Email", value: contacts.email, step: 0 },
                    {
                      label: t("Position", "Посада"),
                      value: [work.desiredRank, work.availableFrom && isIso(work.availableFrom) ? `${t("from", "з")} ${isoToText(work.availableFrom)}` : ""].filter(Boolean).join(", "),
                      step: 1,
                    },
                    { label: t("Documents", "Документи"), value: String(form.documents.filter((d) => d.number.trim() || d.issueDate || d.expiry).length), step: 2 },
                    { label: t("Certificates", "Сертифікати"), value: String(form.certificates.filter((c) => c.name.trim()).length), step: 3 },
                    { label: t("Contracts", "Контракти"), value: String(form.voyages.filter((v) => v.vesselName.trim()).length), step: 4 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3 px-4 sm:px-5 py-2">
                      <dt className="w-28 sm:w-40 flex-shrink-0 text-sm sm:text-base text-muted-foreground">{row.label}</dt>
                      <dd className="flex-1 min-w-0 text-base text-foreground break-words">{row.value || "—"}</dd>
                      <button
                        type="button"
                        onClick={() => goTo(row.step)}
                        className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-sm text-cyan-300 hover:text-cyan-200"
                        aria-label={`${t("Change", "Змінити")}: ${row.label}`}
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{t("Change", "Змінити")}</span>
                      </button>
                    </div>
                  ))}
                </dl>
              </Section>

              <Section bare icon={MessageSquare} title={t("About you", "Про себе")}>
                <Field label={t("Anything else we should know (optional)", "Що ще нам варто знати (необов’язково)")}>
                  <Textarea
                    rows={5}
                    maxLength={2000}
                    value={work.aboutMe}
                    onChange={(e) => setWork("aboutMe", e.target.value)}
                    className="rounded-lg px-4 py-3 !text-base bg-background/60 border-border text-foreground placeholder:text-muted-foreground resize-none"
                    placeholder={t(
                      "For example: what vessels and routes you prefer, contract length, why you are looking for a new company, questions for us.",
                      "Наприклад: яким суднам і рейсам надаєте перевагу, бажана тривалість контракту, чому шукаєте нову компанію, запитання до нас."
                    )}
                  />
                </Field>
              </Section>

              <div className="glass-card rounded-2xl p-5 sm:p-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                    className="mt-1 accent-cyan-400 w-6 h-6 flex-shrink-0"
                    data-testid="checkbox-consent"
                  />
                  <span className="text-base text-foreground leading-relaxed">
                    {t(
                      "The information is correct, and I agree that AURA SEA processes it to find me work at sea and sends my profile to ship-owners for specific vacancies, including outside Ukraine and the EU.",
                      "Дані правдиві, і я погоджуюся, що AURA SEA обробляє їх для мого працевлаштування в морі й надсилає анкету судновласникам під конкретні вакансії, зокрема за межі України та ЄС."
                    )}
                    <span className="block mt-1 text-sm text-muted-foreground">
                      {t("Details:", "Детальніше:")}{" "}
                      <Link href="/privacy" className="text-cyan-300 hover:underline">
                        {t("Privacy Policy", "Політика конфіденційності")}
                      </Link>
                    </span>
                  </span>
                </label>
              </div>
            </>
          )}
        </motion.div>

        {error && (
          <div ref={errorRef} role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={() => goTo(step - 1)} className="h-12 text-base" data-testid="button-apply-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back", "Назад")}
            </Button>
          ) : (
            <span />
          )}
          {last ? (
            <Button
              type="submit"
              disabled={status === "sending"}
              aria-busy={status === "sending"}
              size="lg"
              className="h-12 text-base sm:min-w-[300px] font-normal transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg hover:shadow-cyan-500/20"
              data-testid="button-submit-application"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                  {t("Sending…", "Надсилаємо…")}
                </>
              ) : (
                t("Send application", "Надіслати анкету")
              )}
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={next} className="h-12 text-base sm:min-w-[300px] font-normal" data-testid="button-apply-next">
              {t(`Next: ${STEPS[step + 1].title.en}`, `Далі: ${STEPS[step + 1].title.uk}`)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
        <AnimatePresence>
          {removed && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              className="fixed z-50 bottom-4 inset-x-4 mx-auto max-w-md flex items-center justify-between gap-4 rounded-full bg-slate-900/95 border border-white/15 px-5 py-2 shadow-xl"
              data-testid="apply-undo"
            >
              <span className="text-base text-white">{t("Row removed", "Рядок видалено")}</span>
              <button type="button" onClick={undoRemove} className="min-h-[44px] px-3 text-base font-medium text-cyan-300 hover:text-cyan-200">
                {t("Undo", "Повернути")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-sm text-white/60 font-light text-center">
          {t("Your answers are saved in this browser until you send them.", "Ваші відповіді зберігаються в цьому браузері, доки ви їх не надішлете.")}
        </p>
      </form>
    </div>
    </ErrorsContext.Provider>
  );
}
