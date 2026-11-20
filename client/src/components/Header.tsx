import { Link, useLocation } from "wouter";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { pathFor, useLang, useT, type Lang } from "@/lib/i18n";
import { saveLang } from "./LanguageGate";

/** UA | EN: the same page in the other language ("~" — path from the site root, outside the /en section). */
function LanguageSwitch({ className, onPick }: { className?: string; onPick?: () => void }) {
  const lang = useLang();
  const [location] = useLocation();
  const items: { code: Lang; label: string; title: string }[] = [
    { code: "uk", label: "UA", title: "Українська" },
    { code: "en", label: "EN", title: "English" },
  ];
  return (
    <div role="group" aria-label="Language / Мова" className={cn("inline-flex rounded-full border border-white/20 p-0.5 text-sm font-semibold", className)}>
      {items.map((it) => (
        <Link
          key={it.code}
          href={"~" + pathFor(location, it.code)}
          onClick={() => {
            // Remember the choice: next visits open the site in this language
            saveLang(it.code);
            onPick?.();
          }}
          title={it.title}
          aria-current={lang === it.code ? "true" : undefined}
          hrefLang={it.code}
          data-testid={`lang-${it.code}`}
          className={cn(
            "px-2.5 py-1 rounded-full transition-colors",
            lang === it.code ? "bg-white/15 text-white" : "text-white/70 hover:text-cyan-200"
          )}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}

export default function Header() {
  const [location] = useLocation();
  const t = useT();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", id: "home", label: t("Home", "Головна") },
    { href: "/about", id: "about", label: t("About", "Про нас") },
    { href: "/ship-owners", id: "for-ship-owners", label: t("For Ship-Owners", "Судновласникам") },
    { href: "/seafarers", id: "for-seafarers", label: t("For Seafarers", "Морякам") },
    { href: "/vacancies", id: "vacancies", label: t("Vacancies", "Вакансії") },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-card border-b border-border shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center cursor-pointer">
              <Logo />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`link-${link.id}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "header-nav-ghost text-base font-semibold border-0",
                  location === link.href
                    ? "bg-transparent text-white hover:bg-transparent hover:text-cyan-200 underline underline-offset-8 decoration-white/80 hover:decoration-cyan-200/90"
                    : "text-white/90 hover:text-cyan-200"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitch />
            <Link
              href="/apply"
              data-testid="button-apply-cta"
              data-umami-event="apply-button-header"
              className={cn(buttonVariants({ size: "sm" }), "font-medium")}
            >
              {t("Apply Now", "Подати анкету")}
            </Link>
            <Link
              href="/contact"
              data-testid="button-contact-cta"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "font-medium")}
            >
              {t("Contact Us", "Контакти")}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitch />
          <Button
            variant="ghost"
            size="icon"
            className="header-nav-ghost md:hidden text-white/90 hover:text-cyan-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className={`md:hidden pb-4 space-y-2 rounded-xl p-2 animate-in fade-in slide-in-from-top-4 duration-300 ease-out ${
              isScrolled
                ? "glass-card border border-border shadow-md"
                : "border border-white/15 bg-slate-950/75 backdrop-blur-xl"
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "header-nav-ghost w-full justify-start text-base font-semibold border-0",
                  location === link.href
                    ? "bg-transparent text-white hover:bg-transparent hover:text-cyan-200 underline underline-offset-8 decoration-white/80 hover:decoration-cyan-200/90"
                    : "text-white/90 hover:text-cyan-200"
                )}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-link-${link.id}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/apply"
              className={cn(buttonVariants(), "w-full font-medium")}
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-button-apply"
              data-umami-event="apply-button-header"
            >
              {t("Apply Now", "Подати анкету")}
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "secondary" }), "w-full font-medium")}
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-button-contact"
            >
              {t("Contact Us", "Контакти")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
