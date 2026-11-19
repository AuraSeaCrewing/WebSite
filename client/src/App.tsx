import { useEffect } from "react";
import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import ShipOwners from "@/pages/ShipOwners";
import Seafarers from "@/pages/Seafarers";
import Vacancies from "@/pages/Vacancies";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Apply from "@/pages/Apply";
import NotFound from "@/pages/not-found";
import { LangProvider, type Lang } from "@/lib/i18n";
import LanguageGate from "@/components/LanguageGate";

const wouterBase = import.meta.env.BASE_URL.replace(/\/$/, "") || "";

/** New page opens at the top (the browser keeps the scroll position on client-side navigation). */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/index.html" component={Home} />
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/ship-owners" component={ShipOwners} />
      <Route path="/seafarers" component={Seafarers} />
      <Route path="/vacancies" component={Vacancies} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/apply" component={Apply} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Site({ lang }: { lang: Lang }) {
  return (
    <LangProvider lang={lang}>
      <ScrollToTop />
      <Layout>
        <AppRoutes />
      </Layout>
    </LangProvider>
  );
}

/** The language choice screen sits above both language sections, so it fades out smoothly whichever is picked. */
function Gate() {
  const [location] = useLocation();
  return <LanguageGate lang={/^\/en(\/|$)/.test(location) ? "en" : "uk"} />;
}

function App() {
  return (
    <TooltipProvider>
      {/* Real paths so search engines index every page; .htaccess serves index.html for them.
          Ukrainian at the root (/about), English nested under /en (/en/about): links inside a page
          stay "/about" and resolve to the right language automatically. */}
      <WouterRouter base={wouterBase}>
        <Gate />
        <Switch>
          <Route path="/en" nest>
            <Site lang="en" />
          </Route>
          <Route>
            <Site lang="uk" />
          </Route>
        </Switch>
      </WouterRouter>
    </TooltipProvider>
  );
}

export default App;
