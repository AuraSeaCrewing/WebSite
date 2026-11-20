import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, useParams } from "wouter";
import { motion, type Variants } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Loader2, MessageCircle, Send } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RANKS } from "@/lib/application-options";
import { track } from "@/lib/analytics";
import { useLang, usePageMeta, useT } from "@/lib/i18n";
import { orderedServices, serviceBySlug, type PlanKey, type Service as ServiceData } from "@/lib/services";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import { TimeAndMoney } from "@/components/TimeAndMoney";

// One page per paid service (/services/:slug). Hidden from search engines (noindex, not in the sitemap):
// seafarers come from the "For Seafarers" tiles, from the application form and from links the agency sends.

const CRM_URL = (import.meta.env.VITE_CRM_URL as string | undefined) ?? "https://crm.aurasea.org";
const WHATSAPP = "380978458147";
const EASE = [0.22, 1, 0.36, 1] as const;
const rise: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };
const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-80px" } } as const;
const inputClass =
  "mt-1 h-12 rounded-lg px-4 !text-base bg-background/60 border-border text-foreground placeholder:text-muted-foreground aria-[invalid=true]:border-red-400";

/** Keep the page out of search results while it is open. */
function useNoIndex() {
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
}

export default function Service() {
  const { slug = "" } = useParams<{ slug: string }>();
  const service = serviceBySlug(slug);
  if (!service) return <NotFound />;
  return <ServicePage key={service.slug} service={service} />;
}

function ServicePage({ service }: { service: ServiceData }) {
  const t = useT();
  const lang = useLang();
  const l = (x: { en: string; uk: string }) => x[lang];
  useNoIndex();
  usePageMeta(`/services/${service.slug}`, service.name, service.meta);
  const [plan, setPlan] = useState<PlanKey | "">("");
  const Icon = service.icon;

  const choosePlan = (key: PlanKey) => {
    setPlan(key);
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative bg-[#0b1118] text-white">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[78svh] flex items-end overflow-hidden">
        <motion.img
          src={service.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: EASE }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/70 to-[#0b1118]/20" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
          className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-14 sm:pb-20"
        >
          <motion.p variants={rise} className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold uppercase tracking-wider text-cyan-300">
            <Icon className="w-5 h-5" aria-hidden="true" />
            {l(service.eyebrow)}
          </motion.p>
          <motion.h1 variants={rise} className="mt-4 font-headline text-4xl sm:text-6xl font-bold tracking-tight leading-[1.02] max-w-4xl text-balance" data-testid="service-title">
            {l(service.title)}
          </motion.h1>
          <motion.p variants={rise} className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed max-w-3xl">
            {l(service.lead)}
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="#request" className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg !text-white gap-2")} data-testid="service-cta">
              {t("Leave a request", "Залишити заявку")}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t(`Hello! I'm interested in the service "${service.name.en}".`, `Вітаю! Мене цікавить послуга «${service.name.uk}».`))}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "h-14 px-8 text-lg !text-white gap-2")}
              onClick={() => track(`service-whatsapp-${service.slug}`)}
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              {t("Write on WhatsApp", "Написати у WhatsApp")}
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ TIME AND MONEY ═══════════ */}
      <TimeAndMoney className="pb-0 sm:pb-0" />

      {/* ═══════════ SOUNDS FAMILIAR ═══════════ */}
      <section className="py-20 sm:py-28">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-headline text-3xl sm:text-4xl font-semibold">{t("Sounds familiar?", "Знайомо?")}</h2>
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {service.pains.map((p) => (
              <li key={p.en} className="border-t border-white/15 py-5 text-lg sm:text-xl text-white/85 leading-relaxed">
                {l(p)}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ═══════════ PACKAGES (own crewing only) ═══════════ */}
      {service.plans && (
        <section className="pb-20 sm:pb-28">
          <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold">{t("Packages", "Пакети")}</h2>
            <p className="mt-3 text-lg text-white/75">{t("Each next package includes the previous one. Price on request.", "Кожен наступний пакет містить попередній. Ціна за запитом.")}</p>
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {service.plans.map((p) => {
                const top = p.key === "vip";
                return (
                  <div
                    key={p.key}
                    className={cn(
                      "glass-card rounded-2xl p-6 sm:p-8 flex flex-col",
                      top && "border-cyan-400/60 shadow-[0_0_40px_-12px_rgba(102,228,245,0.45)]"
                    )}
                    data-testid={`plan-${p.key}`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-headline text-3xl font-bold">{p.name}</h3>
                      {p.note && <span className="rounded-full border border-cyan-400/60 px-3 py-0.5 text-sm text-cyan-300">{l(p.note)}</span>}
                    </div>
                    <p className="mt-2 text-base text-cyan-200/90">{l(p.lead)}</p>
                    <ul className="mt-6 space-y-3 flex-1">
                      {p.items.map((it) => (
                        <li key={it.en} className="flex items-start gap-3 text-base text-white/85 leading-snug">
                          <Check className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          {l(it)}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 text-sm text-white/60">{t("Price on request", "Ціна за запитом")}</p>
                    <button
                      type="button"
                      onClick={() => choosePlan(p.key)}
                      className={cn(buttonVariants({ size: "lg", variant: top ? "default" : "secondary" }), "mt-3 h-12 w-full text-base !text-white")}
                    >
                      {t(`Choose ${p.name}`, `Обрати ${p.name}`)}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══════════ HOW WE WORK ═══════════ */}
      <section className="py-20 sm:py-28 bg-white/[0.03] border-y border-white/10">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-headline text-3xl sm:text-4xl font-semibold">{t("What we do", "Що ми робимо")}</h2>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {service.work.map((w, i) => (
              <li key={w.title.en} className="flex gap-5">
                <span className="font-headline text-4xl font-bold text-cyan-300/80 tabular-nums leading-none">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-headline text-xl font-semibold">{l(w.title)}</span>
                  <span className="mt-1.5 block text-base sm:text-lg text-white/80 leading-relaxed">{l(w.text)}</span>
                </span>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      {/* ═══════════ OUTCOMES + HONEST TERMS ═══════════ */}
      <section className="py-20 sm:py-28">
        <motion.div {...inView} variants={rise} className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold">{t("What you get", "Що ви отримуєте")}</h2>
            <ul className="mt-8 space-y-4">
              {service.outcomes.map((o) => (
                <li key={o.en} className="flex items-start gap-3 text-lg text-white/90 leading-relaxed">
                  <Check className="w-6 h-6 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {l(o)}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:p-8 self-start">
            <h3 className="font-headline text-xl font-semibold">{t("How it works", "Як ми працюємо")}</h3>
            <ol className="mt-4 space-y-3 text-base text-white/85 list-decimal pl-5 marker:text-cyan-300">
              <li>{t("You leave a request or write to us.", "Ви залишаєте заявку або пишете нам.")}</li>
              <li>{t("We call you, clarify the task and name the price.", "Ми телефонуємо, уточнюємо задачу й називаємо ціну.")}</li>
              <li>{t("Each stage is paid separately — you see what you pay for.", "Кожен етап оплачується окремо — ви бачите, за що платите.")}</li>
              <li>{t("We work with you until the stage is done.", "Працюємо з вами, доки етап не буде завершено.")}</li>
            </ol>
            <p className="mt-5 text-base text-white/75 leading-relaxed">
              {t(
                "This is an investment in your income and better working conditions — we help you get there faster.",
                "Це вкладення у ваш дохід і кращі умови роботи — ми допомагаємо пройти цей шлях швидше."
              )}
            </p>
            {service.slug !== "crewing-start" && service.slug !== "documents" && (
              <p className="mt-3 text-sm text-white/55 leading-relaxed">
                {t(
                  "The hiring decision is made by the employer. We prepare you and give you the best chance.",
                  "Рішення про прийом на роботу ухвалює роботодавець. Ми готуємо вас і даємо найкращі шанси."
                )}
              </p>
            )}
          </div>
        </motion.div>
      </section>

      {/* ═══════════ REQUEST ═══════════ */}
      <section id="request" className="scroll-mt-24 py-20 sm:py-28 bg-white/[0.03] border-t border-white/10">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className="font-headline text-3xl sm:text-4xl font-semibold">{t("Leave a request", "Залишити заявку")}</h2>
          <p className="mt-3 text-lg text-white/75">
            {t("We will call you back, clarify the task and name the price.", "Ми передзвонимо, уточнимо задачу й назвемо ціну.")}
          </p>
          <RequestForm service={service} plan={plan} setPlan={setPlan} />
          <p className="mt-8 text-base text-white/75">
            {t("Prefer to write?", "Зручніше написати?")}{" "}
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t(`Hello! I'm interested in the service "${service.name.en}".`, `Вітаю! Мене цікавить послуга «${service.name.uk}».`))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:underline"
              onClick={() => track(`service-whatsapp-${service.slug}`)}
            >
              WhatsApp
            </a>
            {" · "}
            <a href={`https://t.me/+${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline" onClick={() => track(`service-telegram-${service.slug}`)}>
              Telegram
            </a>
            {" · "}
            <a href="mailto:crewing@aurasea.org" className="text-cyan-300 hover:underline">
              crewing@aurasea.org
            </a>
          </p>
        </div>
      </section>

      {/* ═══════════ OTHER SERVICES ═══════════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-headline text-2xl sm:text-3xl font-semibold">{t("Other services", "Інші послуги")}</h2>
          <ServiceTiles exclude={service.slug} className="mt-8" />
        </div>
      </section>
    </div>
  );
}

/**
 * Tiles of all services: on "For Seafarers", after an application and at the end of each service page.
 * The most asked-for services first, each with its photo and who it is for; own crewing — a different
 * audience — closes the set as one wide tile. The whole tile is the link.
 */
export function ServiceTiles({ exclude, className }: { exclude?: string; className?: string }) {
  const lang = useLang();
  const t = useT();
  const list = orderedServices().filter((s) => s.slug !== exclude);
  const regular = list.filter((s) => s.slug !== "crewing-start");
  const wide = list.find((s) => s.slug === "crewing-start");
  const tile = (s: ServiceData, wideTile: boolean, spanBoth: boolean) => {
    const Icon = s.icon;
    return (
      <li key={s.slug} className={cn(spanBoth && "sm:col-span-2")}>
        <Link
          href={`/services/${s.slug}`}
          className={cn(
            "group relative flex h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0e1722] transition-colors duration-200 hover:border-cyan-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
            wideTile ? "flex-col md:flex-row" : "flex-col"
          )}
          data-testid={`service-tile-${s.slug}`}
          data-umami-event={`service-tile-${s.slug}`}
        >
          <span className={cn("relative block overflow-hidden", wideTile ? "h-40 md:h-auto md:w-1/2" : "h-40 sm:h-48")}>
            <img
              src={s.tile}
              alt=""
              loading="lazy"
              style={s.tileFocus ? { objectPosition: s.tileFocus } : undefined}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-[#0e1722] via-[#0e1722]/30 to-transparent" />
          </span>
          <span className={cn("relative flex flex-1 flex-col gap-2 p-5 sm:p-6", wideTile && "md:justify-center md:p-8")}>
            <span className="flex items-center gap-2.5">
              <Icon className="w-6 h-6 text-cyan-300 flex-shrink-0" aria-hidden="true" />
              <span className="font-headline text-xl sm:text-2xl font-semibold text-white">{s.name[lang]}</span>
            </span>
            <span className="text-base text-white/75 leading-snug flex-1">{s.forWhom[lang]}</span>
            <span className="mt-1 inline-flex items-center gap-1.5 text-base font-medium text-cyan-300">
              {t("Learn more", "Детальніше")}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </span>
        </Link>
      </li>
    );
  };
  return (
    <ul className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5", className)}>
      {regular.map((s, i) => tile(s, false, regular.length % 2 === 1 && i === regular.length - 1))}
      {wide && tile(wide, true, true)}
    </ul>
  );
}

type Errors = Partial<Record<"fullName" | "phone" | "email" | "consent" | "form", string>>;

function RequestForm({ service, plan, setPlan }: { service: ServiceData; plan: PlanKey | ""; setPlan: (p: PlanKey | "") => void }) {
  const t = useT();
  const lang = useLang();
  const id = useId();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", rank: "", message: "", consent: false, website: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.fullName.trim().length < 2) e.fullName = t("Enter your name.", "Вкажіть ім’я.");
    if (form.phone.replace(/\D/g, "").length < 7) e.phone = t("Enter a phone number with the country code.", "Вкажіть номер телефону з кодом країни.");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t("Check the email address.", "Перевірте адресу email.");
    if (!form.consent) e.consent = t("Please confirm your consent.", "Підтвердьте, будь ласка, згоду.");
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch(`${CRM_URL}/api/public/service-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: service.slug, plan, locale: lang, ...form }),
      });
      if (res.ok) {
        setState("sent");
        track(`service-request-${service.slug}`);
        return;
      }
      setState("idle");
      if (res.status === 422) {
        const body = (await res.json().catch(() => ({}))) as { fields?: string[] };
        const f = body.fields ?? [];
        setErrors({
          ...(f.includes("phone") && { phone: t("We could not recognise this number. Add the country code, e.g. +380.", "Не вдалося розпізнати номер. Додайте код країни, напр. +380.") }),
          ...(f.includes("email") && { email: t("Check the email address.", "Перевірте адресу email.") }),
          ...(!f.includes("phone") && !f.includes("email") && { form: t("Please check the form.", "Перевірте, будь ласка, форму.") }),
        });
      } else if (res.status === 429) {
        setErrors({ form: t("Too many requests. Please try again later or write to us on WhatsApp.", "Забагато заявок. Спробуйте пізніше або напишіть нам у WhatsApp.") });
      } else {
        setErrors({ form: t("The request was not sent. Please try again or write to us on WhatsApp.", "Заявку не надіслано. Спробуйте ще раз або напишіть нам у WhatsApp.") });
      }
    } catch {
      setState("idle");
      setErrors({ form: t("No connection. Please try again or write to us on WhatsApp.", "Немає з’єднання. Спробуйте ще раз або напишіть нам у WhatsApp.") });
    }
  };

  if (state === "sent") {
    return (
      <div className="mt-8 glass-card rounded-2xl p-6 sm:p-8 border-cyan-400/50" role="status" data-testid="service-request-sent">
        <p className="flex items-center gap-3 font-headline text-2xl font-semibold">
          <Check className="w-7 h-7 text-emerald-400" aria-hidden="true" />
          {t("Request sent", "Заявку надіслано")}
        </p>
        <p className="mt-3 text-lg text-white/85">
          {t("We will call you back on the number you gave, usually within one working day.", "Ми передзвонимо на вказаний номер, зазвичай протягом робочого дня.")}
        </p>
      </div>
    );
  }

  const field = (name: keyof Errors) => ({
    id: `${id}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });
  const error = (name: keyof Errors) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-red-300">
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
        {errors[name]}
      </p>
    ) : null;
  const label = "block text-base text-white/90";

  return (
    <form onSubmit={submit} noValidate className="mt-8 glass-card rounded-2xl p-5 sm:p-8 space-y-5" aria-busy={state === "sending"} data-testid="service-request-form">
      {service.plans && (
        <fieldset>
          <legend className={label}>{t("Package", "Пакет")}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {service.plans.map((p) => (
              <label
                key={p.key}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center justify-center rounded-lg border text-base font-semibold transition-colors",
                  plan === p.key ? "border-cyan-400 bg-cyan-500/15 text-white" : "border-white/20 text-white/80 hover:border-cyan-400/50"
                )}
              >
                <input type="radio" name="plan" value={p.key} checked={plan === p.key} onChange={() => setPlan(p.key)} className="sr-only" />
                {p.name}
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-sm text-white/55">{t("Not sure yet? Leave it empty — we will advise.", "Ще не визначилися? Залиште порожнім — порадимо.")}</p>
        </fieldset>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor={`${id}-fullName`} className={label}>
            {t("Name", "Ім’я")} <span className="text-cyan-300">*</span>
          </label>
          <Input {...field("fullName")} autoComplete="name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputClass} />
          {error("fullName")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={label}>
            {t("Phone (WhatsApp, Telegram)", "Телефон (WhatsApp, Telegram)")} <span className="text-cyan-300">*</span>
          </label>
          <Input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="+380" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
          {error("phone")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={label}>
            Email
          </label>
          <Input {...field("email")} type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
          {error("email")}
        </div>
        <div>
          <label htmlFor={`${id}-rank`} className={label}>
            {t("Your rank", "Ваша посада")}
          </label>
          <Input id={`${id}-rank`} list={`${id}-ranks`} value={form.rank} onChange={(e) => set("rank", e.target.value)} className={inputClass} placeholder={t("e.g. 3rd Officer", "напр. 3rd Officer")} />
          <datalist id={`${id}-ranks`}>
            {RANKS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-message`} className={label}>
          {t("Your question or goal", "Ваше питання чи мета")}
        </label>
        <Textarea
          id={`${id}-message`}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          rows={4}
          maxLength={2000}
          className="mt-1 rounded-lg px-4 py-3 !text-base bg-background/60 border-border text-foreground"
        />
      </div>
      {/* Trap for bots: people don't see this field */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
        </label>
      </div>
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...field("consent")}
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-1 accent-cyan-400 w-6 h-6 flex-shrink-0"
          />
          <span className="text-base text-white/85 leading-relaxed">
            {t("I agree that AURA SEA processes my contacts to answer this request.", "Погоджуюся, що AURA SEA обробляє мої контакти, щоб відповісти на цю заявку.")}{" "}
            <Link href="/privacy" className="text-cyan-300 hover:underline">
              {t("Privacy Policy", "Політика конфіденційності")}
            </Link>
          </span>
        </label>
        {error("consent")}
      </div>
      {errors.form && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-base text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          {errors.form}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className={cn(buttonVariants({ size: "lg" }), "h-14 w-full text-lg !text-white gap-2")}
        data-testid="service-request-submit"
      >
        {state === "sending" ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Send className="w-5 h-5" aria-hidden="true" />}
        {state === "sending" ? t("Sending…", "Надсилаємо…") : t("Send request", "Надіслати заявку")}
      </button>
    </form>
  );
}
