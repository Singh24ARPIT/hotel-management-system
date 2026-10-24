const STORAGE_KEY = "hms.preview.reviews.v1";

function config() {
  return window.HMS_CONFIG || {};
}

export function isDemoMode() {
  return Boolean(config().demoMode);
}

export function isLiveConfigured() {
  return Boolean(config().supabaseUrl && config().supabaseAnonKey);
}

function makePreviewReference() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) =>
    byte.toString(36).padStart(2, "0")
  )
    .join("")
    .slice(0, 5)
    .toUpperCase();
  return `HMS-${stamp}-${suffix}`;
}

function savePreviewReview(review) {
  let existing = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(parsed)) existing = parsed;
  } catch {
    existing = [];
  }

  existing.unshift(review);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
}

async function submitToSupabase(review) {
  const settings = config();
  if (!isLiveConfigured()) {
    throw new Error(
      "The feedback service is not connected yet. Please contact the hotel directly."
    );
  }

  const endpoint = `${settings.supabaseUrl.replace(/\/$/, "")}/functions/v1/${settings.submitFunction}`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: settings.supabaseAnonKey,
        Authorization: `Bearer ${settings.supabaseAnonKey}`
      },
      body: JSON.stringify(review),
      signal: controller.signal
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload.message ||
          "We could not save your feedback. Please try again."
      );
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Please check your connection and try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * Persist a review. In preview mode it never leaves the browser.
 * In production mode the browser calls the Supabase edge function, which
 * validates the invitation and writes the review using the service role.
 */
export async function submitReview(review) {
  if (isDemoMode()) {
    const saved = {
      ...review,
      reference: makePreviewReference(),
      submittedAt: new Date().toISOString(),
      mode: "preview"
    };
    savePreviewReview(saved);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return {
      reference: saved.reference,
      preview: true
    };
  }

  return submitToSupabase(review);
}
