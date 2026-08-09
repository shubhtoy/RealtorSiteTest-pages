import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { isAppsScriptConfigured, isSmtpConfigured, serverEnv } from "@/lib/server-env";

// nodemailer and node:fs require the Node.js runtime (not Edge).
export const runtime = "nodejs";
// Lead submissions must never be cached or statically optimized.
export const dynamic = "force-dynamic";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

// Durable local log of every valid submission (repo-root `.data/`, git-ignored).
const SUBMISSIONS_DIR = path.join(process.cwd(), ".data");
const SUBMISSIONS_FILE = path.join(SUBMISSIONS_DIR, "contact-submissions.json");

// Mirrors the client contact form validator in src/pages/ContactPage.tsx.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactForm = {
  fullName: string;
  email: string;
  phone: string;
  bedroom: string;
  moveIn: string;
  tourType: string;
  message: string;
};

type ContactSubmission = {
  form: ContactForm;
  submittedAt: string;
  page: string;
  siteName: string;
};

type FieldErrors = Partial<Record<"fullName" | "email" | "phone", string>>;

type DeliveryResult = {
  channel: "apps-script" | "smtp";
  ok: boolean;
  error?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Best-effort client IP from the proxy `x-forwarded-for` chain. */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp && realIp.length > 0 ? realIp : "unknown";
}

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

/**
 * Strip CR/LF and control characters so a value can be safely placed in an email
 * header (Subject, Reply-To). Prevents header/SMTP injection via crafted input
 * (e.g. a name containing "\r\nBcc: attacker@evil.com").
 */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]+/g, " ").trim();
}

function validateForm(raw: unknown): { form: ContactForm } | { errors: FieldErrors } {
  const source = isRecord(raw) ? raw : {};
  const fullName = typeof source.fullName === "string" ? source.fullName.trim() : "";
  const email = typeof source.email === "string" ? source.email.trim() : "";
  const phone = typeof source.phone === "string" ? source.phone.trim() : "";

  const errors: FieldErrors = {};
  if (fullName.length === 0) errors.fullName = "Full name is required";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address";
  if (countDigits(phone) < 10) {
    errors.phone = "Phone number must contain at least 10 digits";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    form: {
      fullName,
      email,
      phone,
      bedroom: typeof source.bedroom === "string" ? source.bedroom : "",
      moveIn: typeof source.moveIn === "string" ? source.moveIn : "",
      tourType: typeof source.tourType === "string" ? source.tourType : "",
      message: typeof source.message === "string" ? source.message : "",
    },
  };
}

/** Append the submission to the durable local JSON log (creates dir/file). */
async function persistSubmission(submission: ContactSubmission): Promise<void> {
  await mkdir(SUBMISSIONS_DIR, { recursive: true });

  let existing: ContactSubmission[] = [];
  try {
    const raw = await readFile(SUBMISSIONS_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) existing = parsed as ContactSubmission[];
  } catch {
    // Missing or corrupt file — start a fresh log rather than losing the lead.
  }

  existing.push(submission);
  await writeFile(SUBMISSIONS_FILE, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
}

/** POST the raw submission JSON to the Google Apps Script Web App. */
async function deliverToAppsScript(submission: ContactSubmission): Promise<DeliveryResult> {
  try {
    const response = await fetch(serverEnv.contactAppsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    if (!response.ok) {
      return {
        channel: "apps-script",
        ok: false,
        error: `Apps Script responded ${response.status}`,
      };
    }
    return { channel: "apps-script", ok: true };
  } catch (error) {
    return {
      channel: "apps-script",
      ok: false,
      error: error instanceof Error ? error.message : "Apps Script request failed",
    };
  }
}

/** Send the lead via SMTP (nodemailer), replying to the submitter. */
async function deliverViaSmtp(submission: ContactSubmission): Promise<DeliveryResult> {
  try {
    const { default: nodemailer } = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: serverEnv.smtpHost,
      port: serverEnv.smtpPort,
      secure: serverEnv.smtpSecure,
      auth:
        serverEnv.smtpUser && serverEnv.smtpPass
          ? { user: serverEnv.smtpUser, pass: serverEnv.smtpPass }
          : undefined,
    });

    const from = serverEnv.smtpFrom || serverEnv.smtpUser;
    if (!from) {
      return {
        channel: "smtp",
        ok: false,
        error: "SMTP_FROM or SMTP_USER must be set to send email",
      };
    }

    const { form } = submission;
    await transporter.sendMail({
      from,
      to: serverEnv.contactToEmail,
      replyTo: sanitizeHeaderValue(form.email),
      subject: sanitizeHeaderValue(`New Tour Request - ${form.fullName}`),
      text: [
        `Submitted: ${submission.submittedAt}`,
        `Site: ${submission.siteName}`,
        `Page: ${submission.page}`,
        "",
        `Full name: ${form.fullName}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `Bedroom: ${form.bedroom}`,
        `Move-in: ${form.moveIn}`,
        `Tour type: ${form.tourType}`,
        "",
        "Message:",
        form.message || "(none)",
      ].join("\n"),
    });

    return { channel: "smtp", ok: true };
  } catch (error) {
    return {
      channel: "smtp",
      ok: false,
      error: error instanceof Error ? error.message : "SMTP send failed",
    };
  }
}

export async function POST(request: Request) {
  // 1. Rate limit per client IP (sliding window, single-instance scope).
  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, {
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests, please try again later" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
      },
    );
  }

  // 2. Parse the body (malformed JSON -> 400).
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Malformed JSON in request body" },
      { status: 400 },
    );
  }

  // 3. Server-side validation (-> 400 with per-field errors).
  const record = isRecord(body) ? body : {};
  const validation = validateForm(record.form);
  if ("errors" in validation) {
    return NextResponse.json(
      { ok: false, message: "Validation failed", errors: validation.errors },
      { status: 400 },
    );
  }

  const submission: ContactSubmission = {
    form: validation.form,
    submittedAt:
      typeof record.submittedAt === "string" ? record.submittedAt : new Date().toISOString(),
    page: typeof record.page === "string" ? record.page : "contact",
    siteName: typeof record.siteName === "string" ? record.siteName : "Website",
  };

  // 4. ALWAYS persist first so a lead is never lost, even if delivery fails.
  let persisted = true;
  try {
    await persistSubmission(submission);
  } catch (error) {
    persisted = false;
    console.error("[contact] Failed to persist submission:", error);
  }

  // 5. Deliver to every configured channel (best effort, in parallel).
  const deliveries: Promise<DeliveryResult>[] = [];
  if (isAppsScriptConfigured()) deliveries.push(deliverToAppsScript(submission));
  if (isSmtpConfigured()) deliveries.push(deliverViaSmtp(submission));
  const results = await Promise.all(deliveries);

  // 6. Build the response.
  if (!persisted) {
    return NextResponse.json(
      { ok: false, message: "Failed to save submission", channels: results },
      { status: 500 },
    );
  }

  if (results.length === 0) {
    return NextResponse.json(
      { ok: true, message: "saved; delivery not configured" },
      { status: 200 },
    );
  }

  const failures = results.filter((result) => !result.ok);
  if (failures.length === 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json(
    {
      ok: false,
      message: "Submission saved; some delivery channels failed",
      channels: results,
    },
    { status: 207 },
  );
}
