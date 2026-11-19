import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Anchor, ArrowLeft, ArrowRight, CheckCircle, ClipboardList, FileText, IdCard, Info, MessageSquare, Plus, Ship, Trash2, User, Phone, Users,
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
    short: { en: "About you", uk: "Про вас" },
    icon: User,
    intro: {
      en: "Start with who you are and how to reach you. Write your name in Latin letters exactly as in your international passport — ship-owners check it against your documents. Only fields with * are required; you can come back to any step.",
      uk: "Почнімо з того, хто ви і як з вами зв’язатися. Ім’я та прізвище пишіть латиницею точно як у закордонному паспорті — судновласники звіряють їх із документами. Обов’язкові лише поля з *; до будь-якого кроку можна повернутися.",
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

const selectClass =
  "flex h-9 w-full rounded-md border border-border bg-background/60 px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const inputClass = "mt-1 bg-background/60 border-border text-foreground placeholder:text-muted-foreground";

function Field({ label, required, hint, className, children }: { label: string; required?: boolean; hint?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <Label className="text-foreground font-light text-sm">
        {label}
        {required && <span className="text-cyan-400"> *</span>}
      </Label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground font-light leading-snug">{hint}</p>}
    </div>
  );
}

/** A block of fields. `bare` — the step has one block and its title is already in the step header. */
function Section({ icon: Icon, title, hint, bare, children }: { icon: typeof User; title: string; hint?: string; bare?: boolean; children: ReactNode }) {
  return (
    <section className="glass-card rounded-xl p-6 sm:p-8" aria-label={bare ? title : undefined}>
      {!bare && (
        <div className="flex items-center gap-3 mb-1">
          <Icon className="w-5 h-5 text-cyan-400" />
          <h2 className="font-headline text-xl font-medium text-foreground">{title}</h2>
        </div>
      )}
      {hint && <p className="text-sm text-muted-foreground font-light mb-5">{hint}</p>}
      <div className={cn(!hint && !bare && "mt-5")}>{children}</div>
    </section>
  );
}

function ExpiryInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT();
  const unlimited = value === "unlimited";
  return (
    <div className="space-y-1">
      <Input type="date" value={unlimited ? "" : value} disabled={unlimited} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      <label className="flex items-center gap-2 text-xs text-muted-foreground font-light cursor-pointer">
        <input type="checkbox" checked={unlimited} onChange={(e) => onChange(e.target.checked ? "unlimited" : "")} className="accent-cyan-400" />
        {t("Unlimited", "Безстроковий")}
      </label>
    </div>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="text-muted-foreground hover:text-red-400 transition-colors p-1">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function AddButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={disabled} className="mt-4">
      <Plus className="w-4 h-4 mr-1" /> {children}
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
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-cyan-400 w-4 h-4 flex-shrink-0" data-testid={testId} />
      <span>
        <span className="block text-sm text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground font-light mt-1 leading-snug">{hint}</span>
      </span>
    </label>
  );
}

function Progress({ step, onPick }: { step: number; onPick: (n: number) => void }) {
  const lang = useLang();
  const t = useT();
  return (
    <nav aria-label={t("Application steps", "Кроки анкети")} className="mb-6">
      <p className="text-sm text-white/80 mb-3 text-center sm:hidden">
        {t(`Step ${step + 1} of ${STEPS.length}`, `Крок ${step + 1} з ${STEPS.length}`)} · {STEPS[step].title[lang]}
      </p>
      <ol className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={i} className="flex-1 min-w-0">
              <button
                type="button"
                // Earlier steps can be reopened at any time; later ones only through "Next" (it checks the current step)
                onClick={() => i < step && onPick(i)}
                disabled={i >= step}
                aria-current={current ? "step" : undefined}
                className={cn("w-full text-left group", i < step && "cursor-pointer")}
                data-testid={`apply-step-${i + 1}`}
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-colors",
                    done ? "bg-cyan-400" : current ? "bg-cyan-300" : "bg-white/15"
                  )}
                />
                <span
                  className={cn(
                    "hidden sm:block mt-2 text-xs truncate",
                    current ? "text-white" : done ? "text-cyan-200 group-hover:underline" : "text-white/50"
                  )}
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
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
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

  const set = <K extends "person" | "contacts" | "physical">(group: K, key: keyof Form[K], value: string) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  const setWork = <K extends keyof Form["work"]>(key: K, value: Form["work"][K]) => setForm((f) => ({ ...f, work: { ...f.work, [key]: value } }));

  type ListKey = "documents" | "certificates" | "voyages" | "relatives";
  const setItem = <K extends ListKey>(list: K, i: number, key: keyof Form[K][number], value: string) =>
    setForm((f) => ({ ...f, [list]: f[list].map((it, j) => (j === i ? { ...it, [key]: value } : it)) }));
  const addItem = <K extends ListKey>(list: K, item: Form[K][number]) => setForm((f) => ({ ...f, [list]: [...f[list], item] }));
  const removeItem = (list: ListKey, i: number) => setForm((f) => ({ ...f, [list]: f[list].filter((_, j) => j !== i) }));

  const goTo = (n: number) => {
    setError(null);
    setStep(n);
    // The step changes in place: bring its top into view
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  /** Next: the browser checks the required fields of the current step (only they are on the page). */
  const next = () => {
    if (formRef.current && !formRef.current.reportValidity()) return;
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
        const found = body.fields.map((f) => SECTION_LABELS[f.split(".")[0]]).filter(Boolean);
        const sections = Array.from(new Set(found.map((x) => x[lang])));
        return showError(t(`Please check these sections: ${sections.join(", ")}.`, `Перевірте, будь ласка, розділи: ${sections.join(", ")}.`));
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
          <div className="glass-card rounded-xl p-10 max-w-xl mx-auto text-center" data-testid="application-success">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <h1 className="font-headline text-3xl font-semibold mb-3 text-foreground">{t("Application received", "Анкету отримано")}</h1>
            <p className="text-muted-foreground font-light mb-8">
              {t(
                `Thank you, ${form.person.firstName}! Our crewing team will review your profile and contact you when a suitable position is available.`,
                `Дякуємо, ${form.person.firstName}! Наша команда розгляне вашу анкету й зв’яжеться з вами, коли з’явиться відповідна посада.`
              )}
            </p>
            <Link href="/vacancies" className="text-cyan-400 hover:underline">
              {t("See current vacancies", "Переглянути актуальні вакансії")}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { person, contacts, physical, work } = form;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="fixed inset-0 bg-black/50 z-0" />

      <section className="pt-32 pb-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="font-headline text-4xl sm:text-5xl font-bold mb-6 text-white drop-shadow-md" data-testid="heading-apply">
            {t("Seafarer Application Form", "Анкета моряка")}
          </h1>
          <p className="text-lg text-white drop-shadow-md font-light">
            {t(
              "Six short steps, about 10 minutes. Your answers are saved in this browser, so you can stop and come back later.",
              "Шість коротких кроків, приблизно 10 хвилин. Відповіді зберігаються в цьому браузері — можна зупинитися й повернутися пізніше."
            )}
          </p>
        </motion.div>
      </section>

      <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        {/* Hidden from people; bots fill it in */}
        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
          </label>
        </div>

        <div ref={topRef} className="scroll-mt-24">
          <Progress step={step} onPick={goTo} />
          <div className="glass-card rounded-xl p-5 sm:p-6 flex gap-4" data-testid="apply-step-intro">
            <current.icon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs tracking-wide text-cyan-300 mb-1">
                {t(`Step ${step + 1} of ${STEPS.length}`, `Крок ${step + 1} з ${STEPS.length}`)}
              </p>
              <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">{current.title[lang]}</h2>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">{current.intro[lang]}</p>
            </div>
          </div>
        </div>

        <datalist id="ranks">{RANKS.map((r) => <option key={r} value={r} />)}</datalist>
        <datalist id="vessel-types">{VESSEL_TYPES.map((r) => <option key={r} value={r} />)}</datalist>
        <datalist id="certificates">{CERTIFICATES.map((r) => <option key={r} value={r} />)}</datalist>

        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
          {step === 0 && (
            <>
              <Section icon={User} title={t("Personal details", "Особисті дані")}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label={t("Last name", "Прізвище")} required hint={t("In Latin letters, as in your passport", "Латиницею, як у паспорті")}>
                    <Input required value={person.lastName} onChange={(e) => set("person", "lastName", e.target.value)} className={inputClass} autoComplete="family-name" />
                  </Field>
                  <Field label={t("First name", "Ім’я")} required hint={t("In Latin letters, as in your passport", "Латиницею, як у паспорті")}>
                    <Input required value={person.firstName} onChange={(e) => set("person", "firstName", e.target.value)} className={inputClass} autoComplete="given-name" />
                  </Field>
                  <Field label={t("Middle name", "По батькові")}>
                    <Input value={person.middleName} onChange={(e) => set("person", "middleName", e.target.value)} className={inputClass} autoComplete="additional-name" />
                  </Field>
                  <Field label={t("Date of birth", "Дата народження")} required>
                    <Input type="date" required value={person.birthDate} onChange={(e) => set("person", "birthDate", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Place of birth", "Місце народження")}>
                    <Input value={person.birthPlace} onChange={(e) => set("person", "birthPlace", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Citizenship", "Громадянство")} required>
                    <Input required value={person.citizenship} onChange={(e) => set("person", "citizenship", e.target.value)} className={inputClass} placeholder={t("e.g. Ukraine", "напр. Україна")} />
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

              <Section icon={ClipboardList} title={t("Physical details", "Фізичні дані")} hint={t("Needed to order overalls and safety shoes for you on board.", "Потрібні, щоб замовити для вас комбінезон і захисне взуття на судно.")}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              </Section>

              <Section icon={Phone} title={t("Contacts", "Контакти")} hint={t("We will call or write to you about vacancies. A phone with WhatsApp or Telegram is the fastest way.", "Ми зателефонуємо чи напишемо вам щодо вакансій. Найшвидше — телефон із WhatsApp або Telegram.")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t("Phone (with country code)", "Телефон (з кодом країни)")} required>
                    <Input type="tel" required minLength={5} value={contacts.phone} onChange={(e) => set("contacts", "phone", e.target.value)} className={inputClass} placeholder="+380 …" autoComplete="tel" />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" required value={contacts.email} onChange={(e) => set("contacts", "email", e.target.value)} className={inputClass} autoComplete="email" />
                  </Field>
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
              </Section>

              <Section icon={Users} title={t("Next of kin", "Контактна особа")} hint={t("Who we contact if something happens to you at sea — usually a spouse or parent.", "Кому ми зателефонуємо, якщо з вами щось трапиться в морі, — зазвичай дружина, чоловік чи батьки.")}>
                <div className="space-y-4">
                  {form.relatives.map((r, i) => (
                    <div key={i} className="rounded-lg border border-border/60 p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
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
              </Section>
            </>
          )}

          {step === 1 && (
            <Section bare icon={Anchor} title={t("Position and availability", "Посада та готовність")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("Position applied for", "Бажана посада")} required hint={t("Start typing and pick from the list", "Почніть вводити й оберіть зі списку")}>
                  <Input required list="ranks" value={work.desiredRank} onChange={(e) => setWork("desiredRank", e.target.value)} className={inputClass} placeholder={t("e.g. 2nd Officer", "напр. 2nd Officer")} />
                </Field>
                <Field label={t("Ready to start from", "Готовий з")} hint={t("The date you can join a vessel", "Дата, з якої можете сісти на судно")}>
                  <Input type="date" value={work.availableFrom} onChange={(e) => setWork("availableFrom", e.target.value)} className={inputClass} />
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
                <h3 className="font-headline text-base font-medium text-foreground mb-1">{t("Career plans", "Кар’єрні плани")}</h3>
                <p className="text-xs text-muted-foreground font-light mb-4 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  {t(
                    "Optional. Tick what interests you — a recruiter will contact you for a free consultation on what is needed.",
                    "Необов’язково. Позначте, що вас цікавить, — рекрутер зв’яжеться з вами для безкоштовної консультації щодо того, що для цього потрібно."
                  )}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    {work.fleetChange && (
                      <Field label={t("Which type of vessels?", "На який тип суден?")}>
                        <Input list="vessel-types" value={work.fleetChangeTo} onChange={(e) => setWork("fleetChangeTo", e.target.value)} className={inputClass} placeholder={t("e.g. Oil tanker", "напр. Oil tanker")} />
                      </Field>
                    )}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {step === 2 && (
            <Section bare icon={IdCard} title={t("Documents", "Документи")}>
              <div className="space-y-4">
                {form.documents.map((d, i) => (
                  <div key={i} className="rounded-lg border border-border/60 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-start">
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
                      <Field label={t("Issued", "Виданий")} className="sm:col-span-2">
                        <Input type="date" value={d.issueDate} onChange={(e) => setItem("documents", i, "issueDate", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Valid until", "Дійсний до")} className="sm:col-span-2">
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
                  <div key={i} className="rounded-lg border border-border/60 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-start">
                      <Field label={t("Certificate", "Сертифікат")} className="sm:col-span-3">
                        <Input list="certificates" value={c.name} onChange={(e) => setItem("certificates", i, "name", e.target.value)} className={inputClass} placeholder={t("Start typing, e.g. Basic Safety Training", "Почніть вводити, напр. Basic Safety Training")} />
                      </Field>
                      <Field label={t("Number", "Номер")} className="sm:col-span-3">
                        <Input value={c.number} onChange={(e) => setItem("certificates", i, "number", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Issued by", "Ким виданий")} className="sm:col-span-2">
                        <Input value={c.issuedBy} onChange={(e) => setItem("certificates", i, "issuedBy", e.target.value)} className={inputClass} placeholder={t("Training centre or authority", "Навчальний центр або орган")} />
                      </Field>
                      <Field label={t("Issued", "Виданий")} className="sm:col-span-2">
                        <Input type="date" value={c.issueDate} onChange={(e) => setItem("certificates", i, "issueDate", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Valid until", "Дійсний до")} className="sm:col-span-2">
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
                  <div key={i} className="rounded-lg border border-border/60 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-start">
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
                      <Field label={t("Sign on", "Посадка")} className="sm:col-span-3">
                        <Input type="date" value={v.startDate} onChange={(e) => setItem("voyages", i, "startDate", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t("Sign off", "Списання")} className="sm:col-span-3" hint={t("Empty if you are on board now", "Порожньо, якщо ви зараз на борту")}>
                        <Input type="date" value={v.endDate} onChange={(e) => setItem("voyages", i, "endDate", e.target.value)} className={inputClass} />
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
              <Section bare icon={MessageSquare} title={t("About you", "Про себе")}>
                <Textarea
                  rows={6}
                  maxLength={2000}
                  value={work.aboutMe}
                  onChange={(e) => setWork("aboutMe", e.target.value)}
                  className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground resize-none"
                  placeholder={t(
                    "For example: what vessels and routes you prefer, contract length, why you are looking for a new company, questions for us.",
                    "Наприклад: яким суднам і рейсам надаєте перевагу, бажана тривалість контракту, чому шукаєте нову компанію, запитання до нас."
                  )}
                />
              </Section>

              <div className="glass-card rounded-xl p-6 sm:p-8 space-y-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                    className="mt-1 accent-cyan-400 w-4 h-4 flex-shrink-0"
                    data-testid="checkbox-consent"
                  />
                  <span className="text-sm text-muted-foreground font-light">
                    {t(
                      "I confirm that the information is correct and I consent to AURA SEA processing my personal data to find me employment at sea, and to sending my profile for specific vacancies to ship-owners and ship managers, including those outside Ukraine and the EU, as described in the",
                      "Підтверджую, що дані правдиві, і даю згоду AURA SEA на обробку моїх персональних даних для працевлаштування в морі та на передачу моєї анкети під конкретні вакансії судновласникам і менеджерам суден, зокрема за межами України та ЄС, як описано в"
                    )}{" "}
                    <Link href="/privacy" className="text-cyan-400 hover:underline">
                      {t("Privacy Policy", "Політиці конфіденційності")}
                    </Link>
                    .
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
            <Button type="button" variant="outline" onClick={() => goTo(step - 1)} data-testid="button-apply-back">
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
              className="sm:min-w-[240px] font-normal transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg hover:shadow-cyan-500/20"
              data-testid="button-submit-application"
            >
              {status === "sending" ? t("Sending...", "Надсилаємо...") : t("Send application", "Надіслати анкету")}
            </Button>
          ) : (
            <Button type="button" onClick={next} className="sm:min-w-[240px] font-normal" data-testid="button-apply-next">
              {t(`Next: ${STEPS[step + 1].title.en}`, `Далі: ${STEPS[step + 1].title.uk}`)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
        <p className="text-xs text-white/60 font-light text-center">
          {t("Your answers are saved in this browser until you send them.", "Ваші відповіді зберігаються в цьому браузері, доки ви їх не надішлете.")}
        </p>
      </form>
    </div>
  );
}
