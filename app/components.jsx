import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from "react";

export function RatingStars({ rating }) {
  const filled = Math.round(rating);

  return (
    <div className="rating">
      <div className="rating__stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= filled ? "rating__star rating__star--filled" : "rating__star"}
          >
            {"★"}
          </span>
        ))}
      </div>
      <span>{rating.toFixed(1)}</span>
    </div>
  );
}

export function StarRatingInput({ value, onChange }) {
  const numericValue = Number(value) || 0;

  return (
    <div className="star-input" role="radiogroup" aria-label="Select a review rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= numericValue ? "star-input__button is-active" : "star-input__button"}
          aria-checked={star === numericValue}
          role="radio"
          onClick={() => onChange(String(star))}
        >
          {"★"}
        </button>
      ))}
      <span className="star-input__label">{numericValue}/5</span>
    </div>
  );
}

export function QuantityControl({ value, onDecrease, onIncrease, disabled = false }) {
  return (
    <div className="qty-control">
      <button type="button" onClick={onDecrease} aria-label="Decrease quantity" disabled={disabled}>
        -
      </button>
      <span>{value}</span>
      <button type="button" onClick={onIncrease} aria-label="Increase quantity" disabled={disabled}>
        +
      </button>
    </div>
  );
}

export function ThemeToggle({ theme, onToggle, floating = false }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={floating ? (isDark ? "theme-fab is-dark is-floating" : "theme-fab is-floating") : isDark ? "theme-fab is-dark" : "theme-fab"}
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-fab__track" aria-hidden="true">
        <span className="theme-fab__thumb" />
      </span>
    </button>
  );
}

const ToastContext = createContext({ push: () => {}, dismiss: () => {} });

let toastIdSeed = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, { variant = "info", duration = 4500 } = {}) => {
      if (!message) return null;
      toastIdSeed += 1;
      const id = `t-${Date.now()}-${toastIdSeed}`;
      setToasts((current) => [...current, { id, message: String(message), variant }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.variant}`}>
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function MenuCardSkeleton() {
  return (
    <article className="menu-card menu-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--image" />
      <div className="skeleton skeleton--line skeleton--line--lg" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line skeleton--line--sm" />
    </article>
  );
}

function MenuCardImage({ src, alt }) {
  if (!src) return null;
  return <img src={src} alt={alt} loading="lazy" decoding="async" className="menu-card__image" />;
}

export const MenuCard = memo(function MenuCard({ children }) {
  return <>{children}</>;
});

export { MenuCardImage };

export function MobileBottomNav({ activePage, onNavigate, cartCount = 0 }) {
  const items = [
    { id: "menu", label: "Menu", icon: "🍱" },
    { id: "track", label: "Track", icon: "📍" },
    { id: "account", label: "Account", icon: "👤" },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary navigation">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={activePage === item.id ? "mobile-bottom-nav__item is-active" : "mobile-bottom-nav__item"}
          aria-current={activePage === item.id ? "page" : undefined}
        >
          <span className="mobile-bottom-nav__icon" aria-hidden="true">{item.icon}</span>
          <span className="mobile-bottom-nav__label">{item.label}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => onNavigate("cart")}
        className="mobile-bottom-nav__item mobile-bottom-nav__cart"
      >
        <span className="mobile-bottom-nav__icon" aria-hidden="true">🛒</span>
        <span className="mobile-bottom-nav__label">Cart</span>
        {cartCount > 0 && <span className="mobile-bottom-nav__badge">{cartCount}</span>}
      </button>
    </nav>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}
