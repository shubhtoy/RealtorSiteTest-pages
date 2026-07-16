import "server-only";

/**
 * Server-only environment accessor for the Next.js route handlers.
 *
 * Centralizes reading of `process.env` so route handlers never touch raw env
 * vars directly. The `server-only` import guarantees this module can never be
 * bundled into client code, keeping secrets (SMTP credentials, studio password)
 * off the client.
 *
 * No secret values are hardcoded here — every field reads from the environment.
 * The only default provided is the non-sensitive public contact inbox address.
 */

/** Public contact inbox — safe, non-secret default. */
const DEFAULT_CONTACT_TO_EMAIL = "Contact@babaflats.com";

function readString(value: string | undefined, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(value: string | undefined, fallback = false): boolean {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }
  return fallback;
}

export type ServerEnv = {
  /** Studio editor password. Empty when unset — callers must handle that. */
  studioPassword: string;
  /** Recipient inbox for contact-form leads. */
  contactToEmail: string;
  /** Google Apps Script Web App URL for lead delivery (email + Sheet). */
  contactAppsScriptUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpTo: string;
  /** Google Places API key for live Google reviews (server-only secret). */
  googlePlacesApiKey: string;
  /** Google Place ID whose reviews are displayed. */
  googlePlaceId: string;
};

/**
 * Snapshot of the server environment, read once when this module is first
 * evaluated in the server process (parity with the legacy `server/env.mjs`).
 */
export const serverEnv: ServerEnv = {
  studioPassword: readString(process.env.STUDIO_PASSWORD),
  contactToEmail: readString(
    process.env.CONTACT_TO_EMAIL,
    DEFAULT_CONTACT_TO_EMAIL,
  ),
  contactAppsScriptUrl: readString(process.env.CONTACT_APPS_SCRIPT_URL),
  smtpHost: readString(process.env.SMTP_HOST),
  smtpPort: readNumber(process.env.SMTP_PORT, 587),
  smtpSecure: readBoolean(process.env.SMTP_SECURE, false),
  smtpUser: readString(process.env.SMTP_USER),
  smtpPass: readString(process.env.SMTP_PASS),
  smtpFrom: readString(process.env.SMTP_FROM),
  smtpTo: readString(process.env.SMTP_TO),
  googlePlacesApiKey: readString(process.env.GOOGLE_PLACES_API_KEY),
  googlePlaceId: readString(process.env.GOOGLE_PLACE_ID),
};

/**
 * Fail-fast validation of required server secrets.
 *
 * Call this at the top of any server entrypoint that depends on a configured
 * Studio password (content draft/publish, asset upload). Behavior by mode:
 *
 * - `NODE_ENV === "production"`: throws a descriptive {@link Error} when
 *   `STUDIO_PASSWORD` is missing or empty, so a misconfigured deploy crashes
 *   loudly instead of silently rejecting every Studio request with 401.
 * - Non-production: logs a clear `console.warn` instead of throwing, so local
 *   development still runs without a password configured.
 *
 * There is intentionally NO hardcoded password fallback anywhere in the server
 * path — an unset `STUDIO_PASSWORD` must fail, never quietly authenticate.
 */
export function validateServerEnv(): void {
  const isProduction = process.env.NODE_ENV === "production";

  if (serverEnv.studioPassword.length === 0) {
    const message =
      "STUDIO_PASSWORD is not set. The Studio content endpoints " +
      "(/api/content/draft, /api/content/publish, /api/assets/upload) cannot " +
      "authenticate without it. Set STUDIO_PASSWORD in the server environment.";

    if (isProduction) {
      throw new Error(`[server-env] ${message}`);
    }

    console.warn(
      `[server-env] ${message} Running in non-production mode; Studio requests will be rejected with 401 until it is set.`,
    );
  }
}

/** Whether the Google Apps Script lead webhook is configured. */
export function isAppsScriptConfigured(): boolean {
  return serverEnv.contactAppsScriptUrl.length > 0;
}

/** Whether an SMTP transport can be constructed from the current environment. */
export function isSmtpConfigured(): boolean {
  return serverEnv.smtpHost.length > 0 && serverEnv.smtpPort > 0;
}

/** Whether live Google reviews (Places API) are configured. */
export function isGoogleReviewsConfigured(): boolean {
  return serverEnv.googlePlacesApiKey.length > 0 && serverEnv.googlePlaceId.length > 0;
}
