const SUCCESS_MESSAGE = "Thank you for messaging us! Your email was sent to the team.";
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MIN_HUMAN_FILL_MS = 1200;
const MAX_FORM_AGE_MS = 6 * 60 * 60 * 1000;
const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.datavizstyleguide.com",
  "https://datavizstyleguide.com",
  "http://localhost:4321",
  "http://127.0.0.1:4321"
];
const VALID_REASONS = new Set([
  "Add a style guide",
  "Help creating data viz style guide",
  "Consluting or speaking engagement",
  "General inquiry"
]);
const CONTRIBUTION_ORG_TYPES = new Set([
  "For Profit",
  "Non-Profit",
  "Government",
  "News or Journalism",
  "Higher Education/Research",
  "Education",
  "Commercial",
  "Unspecified"
]);

function sendError(res, status, message) {
  return res.status(status).json({ ok: false, message });
}

function sendSuccess(res, message = SUCCESS_MESSAGE) {
  return res.status(200).json({ ok: true, message });
}

function getRateStore() {
  if (!globalThis.__dvsgRateLimitStore) {
    globalThis.__dvsgRateLimitStore = new Map();
  }

  return globalThis.__dvsgRateLimitStore;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];

  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp.trim();
  }

  return req.socket?.remoteAddress ?? "unknown";
}

function getRequestHost(req) {
  const forwardedHost = req.headers["x-forwarded-host"];

  if (typeof forwardedHost === "string" && forwardedHost.trim().length > 0) {
    return forwardedHost.split(",")[0].trim().toLowerCase();
  }

  const host = req.headers.host;
  return typeof host === "string" ? host.trim().toLowerCase() : "";
}

function normalizeOrigin(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.origin.toLowerCase();
  } catch {
    return "";
  }
}

function getAllowedOrigins() {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => normalizeOrigin(value))
    .filter(Boolean);

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins].map((value) => value.toLowerCase()));
}

function isAllowedRequestOrigin(req, originHeader, refererHeader) {
  const allowedOrigins = getAllowedOrigins();
  const requestHost = getRequestHost(req);
  const requestHostOrigin = requestHost ? `https://${requestHost}` : "";
  const normalizedOrigin = normalizeOrigin(originHeader);
  const normalizedRefererOrigin = normalizeOrigin(refererHeader);

  if (requestHost) {
    if (normalizedOrigin) {
      const originHost = new URL(normalizedOrigin).host.toLowerCase();

      if (originHost === requestHost) {
        return true;
      }
    }

    if (normalizedRefererOrigin) {
      const refererHost = new URL(normalizedRefererOrigin).host.toLowerCase();

      if (refererHost === requestHost) {
        return true;
      }
    }
  }

  if (!normalizedOrigin && !normalizedRefererOrigin) {
    return false;
  }

  const candidates = [normalizedOrigin, normalizedRefererOrigin, requestHostOrigin]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  return candidates.some((candidate) => allowedOrigins.has(candidate));
}

function isRateLimited(ip) {
  const store = getRateStore();
  const now = Date.now();

  for (const [key, timestamps] of store.entries()) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (recent.length === 0) {
      store.delete(key);
      continue;
    }

    store.set(key, recent);
  }

  const attempts = store.get(ip) ?? [];

  if (attempts.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  attempts.push(now);
  store.set(ip, attempts);

  return false;
}

function cleanString(value, maxLength = 1000) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r\n?/g, "\n").trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidHttpsUrl(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function parseRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string" && req.body.length > 0) {
    return JSON.parse(req.body);
  }

  return {};
}

function validateContributionPayload(body) {
  const exampleTitle = cleanString(body.exampleTitle, 180);
  const organization = cleanString(body.organization, 180);
  const organizationType = cleanString(body.organizationType, 80);
  const guidelineUrl = cleanString(body.guidelineUrl, 2048);
  const lastUpdated = cleanString(body.lastUpdated, 120);
  const notes = cleanString(body.notes, 4000);

  if (!exampleTitle) {
    return { valid: false, message: "Example title is required for contributions." };
  }

  if (!organization) {
    return { valid: false, message: "Organization is required for contributions." };
  }

  if (!CONTRIBUTION_ORG_TYPES.has(organizationType)) {
    return { valid: false, message: "Please choose a valid organization type." };
  }

  if (!isValidHttpsUrl(guidelineUrl)) {
    return { valid: false, message: "Please provide a valid https:// guideline URL." };
  }

  return {
    valid: true,
    normalized: {
      exampleTitle,
      organization,
      organizationType,
      guidelineUrl,
      lastUpdated,
      notes
    }
  };
}

async function verifyTurnstile(token, ip, secret) {
  const payload = new URLSearchParams();
  payload.set("secret", secret);
  payload.set("response", token);

  if (ip && ip !== "unknown") {
    payload.set("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload.toString()
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json().catch(() => null);
  return Boolean(data?.success);
}

async function sendEmail({ apiKey, from, to, replyTo, subject, text, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: replyTo,
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend error: ${response.status} ${body}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed.");
  }

  const contentType = String(req.headers["content-type"] || "").toLowerCase();

  if (!contentType.startsWith("application/json")) {
    return sendError(res, 415, "Content type must be application/json.");
  }

  const originHeader = req.headers.origin;
  const refererHeader = req.headers.referer;

  if (!isAllowedRequestOrigin(req, originHeader, refererHeader)) {
    return sendError(res, 403, "Request origin is not allowed.");
  }

  const clientIp = getClientIp(req);

  if (isRateLimited(clientIp)) {
    return sendError(res, 429, "Too many submissions. Please wait a minute and try again.");
  }

  let body;

  try {
    body = await parseRequestBody(req);
  } catch {
    return sendError(res, 400, "Invalid request body.");
  }

  const website = cleanString(body.website, 120);

  if (website.length > 0) {
    return sendSuccess(res);
  }

  const formLoadedAt = Number(body.formLoadedAt);
  const elapsedMs = Date.now() - formLoadedAt;

  if (!Number.isFinite(formLoadedAt) || elapsedMs < MIN_HUMAN_FILL_MS || elapsedMs > MAX_FORM_AGE_MS) {
    return sendSuccess(res);
  }

  const reason = cleanString(body.reason, 120);
  const firstName = cleanString(body.firstName, 80);
  const lastName = cleanString(body.lastName, 80);
  const email = cleanString(body.email, 254).toLowerCase();
  const message = cleanString(body.message, 5000);
  const turnstileToken = cleanString(body["cf-turnstile-response"] ?? body.turnstileToken, 2048);

  if (!VALID_REASONS.has(reason)) {
    return sendError(res, 400, "Please choose a valid reason for contact.");
  }

  if (!firstName || !lastName) {
    return sendError(res, 400, "Please enter your first and last name.");
  }

  if (!isValidEmail(email)) {
    return sendError(res, 400, "Please enter a valid email address.");
  }

  if (message.length < 10) {
    return sendError(res, 400, "Message must be at least 10 characters.");
  }

  if (reason === "Add a style guide") {
    const contributionValidation = validateContributionPayload(body);

    if (!contributionValidation.valid) {
      return sendError(res, 400, contributionValidation.message);
    }
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET;

  if (turnstileSecret) {
    if (!turnstileToken) {
      return sendError(res, 400, "Please complete the spam check and try again.");
    }

    const verified = await verifyTurnstile(turnstileToken, clientIp, turnstileSecret);

    if (!verified) {
      return sendError(res, 400, "Spam check failed. Please try again.");
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toRecipients = (process.env.CONTACT_TO_EMAIL || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!resendApiKey || toRecipients.length === 0) {
    console.error("Contact form configuration missing required email settings.");
    return sendError(res, 503, "Contact form is not configured yet. Please try again shortly.");
  }

  const fromEmail = process.env.CONTACT_FROM_EMAIL || "DataViz Style Guide <onboarding@resend.dev>";
  const subjectPrefix = process.env.CONTACT_SUBJECT_PREFIX || "DVSG Contact";
  const fullName = `${firstName} ${lastName}`;
  const subject = `[${subjectPrefix}] ${reason}`;

  const text = [
    `Reason for Contact: ${reason}`,
    `Name: ${fullName}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
    "",
    `IP: ${clientIp}`
  ].join("\n");

  const html = `
    <p><strong>Reason for Contact:</strong> ${escapeHtml(reason)}</p>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  try {
    await sendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: toRecipients,
      replyTo: email,
      subject,
      text,
      html
    });
  } catch (error) {
    const safeMessage = error instanceof Error ? error.message.slice(0, 300) : "unknown";
    console.error("Contact form send failure:", safeMessage);
    return sendError(res, 502, "Unable to send your message right now. Please try again.");
  }

  return sendSuccess(res);
}
