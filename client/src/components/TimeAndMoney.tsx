import { motion, type Variants } from "framer-motion";
import { Home, TrendingUp } from "lucide-react";

import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// What a seafarer really buys from the paid services (owner's brief, 21.11.2026: "we sell free time
// and money"): days at home with the family instead of queues and offices, and a better-paid next
// contract. Shown on "For Seafarers" above the service tiles and on every service page under the
// first screen. Sells the benefit, promises no result: the employer decides on hiring and pay.

const EASE = [0.22, 1, 0.36, 1] as const;
const rise: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };

export function TimeAndMoney({ className }: { className?: string }) {
  const t = useT();
  const points = [
    {
      icon: Home,
      hook: t("Your leave is for your family, not for queues.", "Відпустка — для родини, а не для черг."),
      text: t(
        "Documents, courses and medicals are organised by us: fewer offices, fewer trips, more days at home.",
        "Документи, курси й медкомісію організуємо ми: менше кабінетів і поїздок — більше днів удома."
      ),
    },
    {
      icon: TrendingUp,
      hook: t("Your experience should be paid more.", "Ваш досвід має коштувати дорожче."),
      text: t(
        "We prepare you for the next rank, a stronger interview and a better fleet — where the pay is higher.",
        "Готуємо до вищої посади, сильнішої співбесіди й кращого флоту — туди, де платять більше."
      ),
    },
  ];
  return (
    <section className={cn("py-16 sm:py-24", className)} data-testid="time-and-money">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-6xl mx-auto px-5 sm:px-8"
      >
        <motion.h2 variants={rise} className="font-headline text-3xl sm:text-5xl font-semibold text-white text-balance max-w-4xl">
          {t("You go to sea for your family and your income.", "Ви йдете в море заради родини й заробітку.")}{" "}
          <span className="text-cyan-300">{t("We take care of both.", "Ми бережемо і те, й інше.")}</span>
        </motion.h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {points.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.hook} variants={rise} className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 sm:p-8">
                <Icon className="w-8 h-8 text-cyan-300" aria-hidden="true" />
                <p className="mt-4 font-headline text-2xl sm:text-3xl font-semibold leading-tight text-white text-balance">{p.hook}</p>
                <p className="mt-3 text-base sm:text-lg text-white/80 leading-relaxed">{p.text}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
