import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Anchor, CheckCircle, ClipboardList, FileText, IdCard, Plus, Ship, Trash2, User, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CERTIFICATES, DOCUMENT_TYPES, EMPLOYMENT_STATUSES, ENGLISH_LEVELS, RANKS, VESSEL_TYPES } from "@/lib/application-options";
import { track } from "@/lib/analytics";
import { useLang, usePageMeta, useT } from "@/lib/i18n";
import heroImage from "@assets/stock_images/stormy_sea_2.webp";

// Seafarer application form. Submits straight into the AURA SEA CRM (POST /api/public/apply), where it
// becomes a draft for a recruiter to review. Field names must match `applicationSchema` in the CRM
// (lib/website/application.ts in AuraSeaCrewing/CRM-Aura-Sea).

const CRM_URL = (import.meta.env.VITE_CRM_URL as string | undefined) ?? "https://crm.aurasea.org";
const DRAFT_KEY = "aurasea-application-draft";

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
  work: { desiredRank: string; willingLowerRank: string; availableFrom: string; expectedSalary: string; englishLevel: string; employmentStatus: string; aboutMe: string };
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
  work: { desiredRank: "", willingLowerRank: "", availableFrom: "", expectedSalary: "", englishLevel: "", employmentStatus: "", aboutMe: "" },
  documents: [emptyDoc("PASSPORT"), emptyDoc("SEAMANS_BOOK")],
  certificates: [emptyCert()],
  voyages: [emptyVoyage()],
  relatives: [emptyRelative()],
  consent: false,
});

function loadDraft(): Form {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...emptyForm(), ...JSON.parse(raw), consent: false };
  } catch {
    /* storage unavailable: start empty */
  }
  return emptyForm();
}

const MAX = { documents: 10, certificates: 40, voyages: 30, relatives: 3 };

/** Section names for the server's list of invalid fields ("contacts.email", "voyages.2.vesselName"). */
const SECTION_LABELS: Record<string, { en: string; uk: string }> = {
  person: { en: "Personal details", uk: "Особисті дані" },
  contacts: { en: "Contacts", uk: "Контакти" },
  physical: { en: "Physical details", uk: "Фізичні дані" },
  work: { en: "Position", uk: "Посада" },
  documents: { en: "Documents", uk: "Документи" },
  certificates: { en: "Certificates", uk: "Сертифікати" },
  voyages: { en: "Sea service", uk: "Стаж у морі" },
  relatives: { en: "Next of kin", uk: "Контактна особа" },
  consent: { en: "Consent", uk: "Згода" },
};

const selectClass =
  "flex h-9 w-full rounded-md border border-border bg-background/60 px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const inputClass = "mt-1 bg-background/60 border-border text-foreground placeholder:text-muted-foreground";

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <Label className="text-foreground font-light text-sm">
        {label}
        {required && <span className="text-cyan-400"> *</span>}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Section({ icon: Icon, title, hint, children }: { icon: typeof User; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="glass-card rounded-xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-1">
        <Icon className="w-5 h-5 text-cyan-400" />
        <h2 className="font-headline text-xl font-medium text-foreground">{title}</h2>
      </div>
      {hint && <p className="text-sm text-muted-foreground font-light mb-5">{hint}</p>}
      <div className={cn(!hint && "mt-5")}>{children}</div>
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

export default function Apply() {
  const t = useT();
  const lang = useLang();
  usePageMeta(
    "/apply",
    { en: "Seafarer Application Form", uk: "Анкета моряка" },
    {
      en: "Apply to AURA SEA online: one form with your documents, certificates and sea service goes straight to our crewing team.",
      uk: "Подайте анкету в AURA SEA онлайн: одна форма з документами, сертифікатами й стажем — одразу до нашої команди.",
    }
  );
  const [form, setForm] = useState<Form>(loadDraft);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Long form: keep progress in this browser until it is sent
  useEffect(() => {
    if (status === "done") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, consent: false }));
    } catch {
      /* storage unavailable */
    }
  }, [form, status]);

  const set = <K extends "person" | "contacts" | "physical" | "work">(group: K, key: keyof Form[K], value: string) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));

  type ListKey = "documents" | "certificates" | "voyages" | "relatives";
  const setItem = <K extends ListKey>(list: K, i: number, key: keyof Form[K][number], value: string) =>
    setForm((f) => ({ ...f, [list]: f[list].map((it, j) => (j === i ? { ...it, [key]: value } : it)) }));
  const addItem = <K extends ListKey>(list: K, item: Form[K][number]) => setForm((f) => ({ ...f, [list]: [...f[list], item] }));
  const removeItem = (list: ListKey, i: number) => setForm((f) => ({ ...f, [list]: f[list].filter((_, j) => j !== i) }));

  const showError = (text: string) => {
    setError(text);
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setError(null);
    if (!form.consent) return showError(t("Please confirm your consent to the processing of personal data.", "Підтвердьте, будь ласка, згоду на обробку персональних даних."));

    // Empty optional rows are not sent: the CRM requires a name in each row that is sent
    const payload = {
      ...form,
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
        } catch {
          /* storage unavailable */
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string; fields?: string[] };
      setStatus("idle");
      if (res.status === 422 && body.fields?.length) {
        const sections = Array.from(new Set(body.fields.map((f) => SECTION_LABELS[f.split(".")[0]]?.[lang] ?? f)));
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

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="fixed inset-0 bg-black/50 z-0" />

      <section className="pt-32 pb-12 relative z-10">
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
            {t("Fill in your details once — they go straight to our crewing team. Fields marked", "Заповніть дані один раз — вони одразу потраплять до нашої команди. Поля, позначені")}{" "}
            <span className="text-cyan-300">*</span>
            {t(" are required; the more you add, the faster we can match you with a vessel.", ", обов’язкові; що більше ви вкажете, то швидше ми підберемо судно.")}
          </p>
        </motion.div>
      </section>

      <form onSubmit={handleSubmit} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-6" noValidate={false}>
        {/* Hidden from people; bots fill it in */}
        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
          </label>
        </div>

        <Section icon={User} title={t("Personal details", "Особисті дані")} hint={t("Name in Latin letters, as in your international passport.", "Ім’я латиницею, як у закордонному паспорті.")}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label={t("Last name", "Прізвище")} required>
              <Input required value={person.lastName} onChange={(e) => set("person", "lastName", e.target.value)} className={inputClass} autoComplete="family-name" />
            </Field>
            <Field label={t("First name", "Ім’я")} required>
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

        <Section icon={Phone} title={t("Contacts", "Контакти")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("Phone (with country code)", "Телефон (з кодом країни)")} required>
              <Input type="tel" required value={contacts.phone} onChange={(e) => set("contacts", "phone", e.target.value)} className={inputClass} placeholder="+380 …" autoComplete="tel" />
            </Field>
            <Field label="Email" required>
              <Input type="email" required value={contacts.email} onChange={(e) => set("contacts", "email", e.target.value)} className={inputClass} autoComplete="email" />
            </Field>
            <Field label="WhatsApp">
              <Input type="tel" value={contacts.whatsapp} onChange={(e) => set("contacts", "whatsapp", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Telegram">
              <Input value={contacts.telegram} onChange={(e) => set("contacts", "telegram", e.target.value)} className={inputClass} placeholder={t("@username or phone", "@username або телефон")} />
            </Field>
            <Field label="Viber">
              <Input type="tel" value={contacts.viber} onChange={(e) => set("contacts", "viber", e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("Nearest airport", "Найближчий аеропорт")}>
              <Input value={contacts.nearestAirport} onChange={(e) => set("contacts", "nearestAirport", e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("Home address", "Домашня адреса")} className="sm:col-span-2">
              <Input value={contacts.address} onChange={(e) => set("contacts", "address", e.target.value)} className={inputClass} autoComplete="street-address" />
            </Field>
          </div>
        </Section>

        <Section icon={Anchor} title={t("Position and availability", "Посада та готовність")}>
          <datalist id="ranks">{RANKS.map((r) => <option key={r} value={r} />)}</datalist>
          <datalist id="vessel-types">{VESSEL_TYPES.map((r) => <option key={r} value={r} />)}</datalist>
          <datalist id="certificates">{CERTIFICATES.map((r) => <option key={r} value={r} />)}</datalist>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("Position applied for", "Бажана посада")} required>
              <Input required list="ranks" value={work.desiredRank} onChange={(e) => set("work", "desiredRank", e.target.value)} className={inputClass} placeholder={t("Start typing, e.g. 2nd Officer", "Почніть вводити, напр. 2nd Officer")} />
            </Field>
            <Field label={t("Ready to start from", "Готовий з")}>
              <Input type="date" value={work.availableFrom} onChange={(e) => set("work", "availableFrom", e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("Would you accept a lower rank?", "Чи готові на нижчу посаду?")}>
              <select value={work.willingLowerRank} onChange={(e) => set("work", "willingLowerRank", e.target.value)} className={selectClass}>
                <option value="">—</option>
                <option value="yes">{t("Yes", "Так")}</option>
                <option value="no">{t("No", "Ні")}</option>
              </select>
            </Field>
            <Field label={t("Current status", "Поточний статус")}>
              <select value={work.employmentStatus} onChange={(e) => set("work", "employmentStatus", e.target.value)} className={selectClass}>
                <option value="">—</option>
                {EMPLOYMENT_STATUSES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.value, o.uk)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("Level of English", "Рівень англійської")}>
              <select value={work.englishLevel} onChange={(e) => set("work", "englishLevel", e.target.value)} className={selectClass}>
                <option value="">—</option>
                {ENGLISH_LEVELS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.value, o.uk)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("Expected salary", "Очікувана зарплата")}>
              <Input value={work.expectedSalary} onChange={(e) => set("work", "expectedSalary", e.target.value)} className={inputClass} placeholder={t("e.g. 6500 USD", "напр. 6500 USD")} />
            </Field>
          </div>
        </Section>

        <Section icon={IdCard} title={t("Documents", "Документи")} hint={t("Passport and seaman's book. Add a visa if you have one.", "Закордонний паспорт і мореплавна книжка. Додайте візу, якщо вона є.")}>
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
                      <Input value={d.name} onChange={(e) => setItem("documents", i, "name", e.target.value)} className={inputClass} placeholder={d.type === "VISA" ? "e.g. Schengen, US C1/D" : ""} />
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

        <Section icon={FileText} title={t("Certificates", "Сертифікати")} hint={t("Certificate of Competency, endorsements, STCW courses, medical certificate.", "Диплом (CoC), підтвердження, курси STCW, медичний сертифікат.")}>
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
                    <Input value={c.issuedBy} onChange={(e) => setItem("certificates", i, "issuedBy", e.target.value)} className={inputClass} />
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

        <Section icon={Ship} title={t("Sea service", "Стаж у морі")} hint={t("Your contracts, most recent first. Leave “Sign off” empty if you are on board now.", "Ваші контракти, починаючи з останнього. Залиште «Списання» порожнім, якщо ви зараз на борту.")}>
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
                  <Field label={t("Sign off", "Списання")} className="sm:col-span-3">
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

        <Section icon={ClipboardList} title={t("Physical details", "Фізичні дані")} hint={t("Needed for overalls and safety shoes.", "Потрібні для комбінезона й захисного взуття.")}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label={t("Height, cm", "Зріст, см")}>
              <Input inputMode="numeric" value={physical.heightCm} onChange={(e) => set("physical", "heightCm", e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("Weight, kg", "Вага, кг")}>
              <Input inputMode="numeric" value={physical.weightKg} onChange={(e) => set("physical", "weightKg", e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("Overall size", "Розмір комбінезона")}>
              <Input value={physical.overallSize} onChange={(e) => set("physical", "overallSize", e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("Shoe size", "Розмір взуття")}>
              <Input value={physical.shoeSize} onChange={(e) => set("physical", "shoeSize", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section icon={Users} title={t("Next of kin", "Контактна особа")} hint={t("Who we contact in case of emergency.", "Кому ми телефонуємо в екстреному випадку.")}>
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

        <Section icon={FileText} title={t("About you", "Про себе")}>
          <Textarea
            rows={5}
            maxLength={2000}
            value={work.aboutMe}
            onChange={(e) => set("work", "aboutMe", e.target.value)}
            className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground resize-none"
            placeholder={t("Anything else we should know: experience, preferences, questions.", "Що ще нам варто знати: досвід, побажання, запитання.")}
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

          {error && (
            <div ref={errorRef} role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={status === "sending"}
            className="w-full font-normal transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg hover:shadow-cyan-500/20"
            data-testid="button-submit-application"
          >
            {status === "sending" ? t("Sending...", "Надсилаємо...") : t("Send application", "Надіслати анкету")}
          </Button>
          <p className="text-xs text-muted-foreground font-light text-center">{t("Your answers are saved in this browser until you send them.", "Ваші відповіді зберігаються в цьому браузері, доки ви їх не надішлете.")}</p>
        </div>
      </form>
    </div>
  );
}
