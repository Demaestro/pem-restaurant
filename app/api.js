export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function apiUrl(pathname) {
  return apiBaseUrl ? `${apiBaseUrl}${pathname}` : pathname;
}

export function apiFetch(pathname, options = {}) {
  return fetch(apiUrl(pathname), {
    ...options,
    credentials: "include",
    headers: {
      "X-PEM-Client": "1",
      ...(options.headers || {}),
    },
  });
}

export async function postJson(url, payload, headers = {}) {
  return requestJson(url, {
    method: "POST",
    payload,
    headers,
  });
}

export async function requestJson(
  url,
  { method = "GET", payload, headers = {}, retryOnTimeout = method === "GET", attempt = 1 } = {},
) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("You're offline right now. Reconnect and try again.");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await apiFetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      if (retryOnTimeout && attempt < 2) {
        return requestJson(url, {
          method,
          payload,
          headers,
          retryOnTimeout,
          attempt: attempt + 1,
        });
      }
      throw new Error("PEM is taking too long to respond. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("PEM could not reach the server. Check your internet or refresh and try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
