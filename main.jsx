import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (typeof console !== "undefined") {
      console.error("[pem-error-boundary]", error, info?.componentStack);
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          background: "#faf7f4",
          color: "#2a1d18",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            background: "#fff",
            borderRadius: 16,
            padding: "32px",
            boxShadow: "0 16px 32px rgba(60, 30, 20, 0.08)",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginTop: 0, color: "#7a1f1f" }}>Something went wrong</h1>
          <p style={{ lineHeight: 1.5 }}>
            PEM hit an unexpected issue while loading this page. Refreshing usually fixes it. If the
            issue keeps happening, please contact PEM support.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              marginTop: 16,
              padding: "12px 22px",
              borderRadius: 10,
              border: "none",
              background: "#9c2a2a",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload PEM
          </button>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
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
