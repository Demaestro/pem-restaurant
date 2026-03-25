import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class AppBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Keep the browser from landing on a blank shell if a runtime render error slips through.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-shell">
          <section className="auth-hero">
            <div className="auth-loading-card">
              <p className="eyebrow">PEM needs a quick refresh</p>
              <h1>We hit a loading issue.</h1>
              <p>
                Refresh this page to load the newest PEM version. If you installed the app,
                reopen it once so the latest update can take over.
              </p>
              <button
                type="button"
                className="button button--primary"
                onClick={() => window.location.reload()}
              >
                Refresh PEM
              </button>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

if (typeof window !== "undefined") {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const resetScrollPosition = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  window.addEventListener("load", resetScrollPosition);
  window.addEventListener("pageshow", resetScrollPosition);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppBoundary>
      <App />
    </AppBoundary>
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  }
}
