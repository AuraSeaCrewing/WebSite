import { Link } from "wouter";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePageMeta, useT } from "@/lib/i18n";

export default function NotFound() {
  const t = useT();
  usePageMeta("/", { en: "Page not found", uk: "Сторінку не знайдено" }, { en: "", uk: "" });
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 pt-24 pb-16">
      <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center">
        <Compass className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
        <h1 className="font-headline text-3xl font-bold mb-3 text-foreground">{t("Page not found", "Сторінку не знайдено")}</h1>
        <p className="text-muted-foreground font-light mb-8">
          {t("This page does not exist or has moved. Let’s get you back on course.", "Такої сторінки немає або її перенесено. Повернімося на курс.")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className={cn(buttonVariants(), "font-normal")}>
            {t("Home page", "На головну")}
          </Link>
          <Link href="/apply" className={cn(buttonVariants({ variant: "secondary" }), "font-normal")}>
            {t("Apply Now", "Подати анкету")}
          </Link>
        </div>
      </div>
    </div>
  );
}
