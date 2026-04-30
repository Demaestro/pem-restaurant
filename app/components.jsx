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
