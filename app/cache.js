export function readCachedJson(key, fallback = null, maxAgeMs = Number.POSITIVE_INFINITY) {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    const parsed = JSON.parse(rawValue);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Object.prototype.hasOwnProperty.call(parsed, "savedAt") &&
      Object.prototype.hasOwnProperty.call(parsed, "value")
    ) {
      if (
        Number.isFinite(maxAgeMs) &&
        maxAgeMs !== Number.POSITIVE_INFINITY &&
        Date.now() - Number(parsed.savedAt || 0) > maxAgeMs
      ) {
        window.localStorage.removeItem(key);
        return fallback;
      }
      return parsed.value;
    }

    if (Number.isFinite(maxAgeMs) && maxAgeMs !== Number.POSITIVE_INFINITY) {
      window.localStorage.removeItem(key);
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
}

export function writeCachedJson(key, value) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        value,
      }),
    );
  } catch {
    // Ignore cache write failures.
  }
}
