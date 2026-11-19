import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { loadAnalytics } from "./lib/analytics";

// Old links used hash routing (aurasea.org/#/apply): move them to the real path before the app starts
if (window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", window.location.hash.slice(1) || "/");
}

loadAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
