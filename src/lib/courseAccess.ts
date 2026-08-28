import { cookies } from "next/headers";
import { webcrypto as crypto } from "node:crypto";

/**
 * Learning-platform auth/entitlement helpers.
 *
 * Auth model (token-exchange SSO): a client, already logged in to the
 * Base44 booking portal, clicks "My Courses" there. Base44's
 * issueCourseAccessToken function mints a short-lived signed token and
 * redirects here to /online-learning/sso?token=... . verifySsoToken()
 * checks that token's signature (shared secret with Base44) and, if
 * valid, the SSO route establishes this site's OWN session cookie via
 * createSessionCookieValue() — independent of the original token, and
 * independent of whatever Base44 itself is doing.
 *
 * Entitlement is NEVER read from the session cookie or cached here — the
 * cookie only proves "this browser is client X". Every protected page
 * calls getEntitledCourses() fresh, which asks Base44 live via the
 * checkCourseAccess backend function. A lapsed or cancelled package loses
 * access on the very next page load, not just at next login.
 *
 * Required env vars:
 *   COURSE_ACCESS_TOKEN_SECRET  — shared with Base44 (verifies the
 *                                 handshake token Base44 mints)
 *   LEARNING_PLATFORM_API_KEY   — shared with Base44 (authenticates our
 *                                 calls to checkCourseAccess)
 *   LEARNING_SESSION_SECRET     — local to this site only, signs our own
 *                                 session cookie
 */

const SESSION_COOKIE = "ds_learning_session";
const BASE44_APP_URL = "https://booking.dogsmarttrainingbehaviour.co.uk";
// Must match the `target` key Base44's issueCourseAccessToken uses for
// this site (see REDIRECT_BASE_BY_TARGET in that function).
const SITE_TARGET = "dogsmart";

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

function base64UrlToBytes(b64url: string): Uint8Array {
  const padded = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSha256(data: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

interface SsoTokenPayload {
  client_id?: string;
  target?: string;
  exp?: number;
}

interface SessionPayload {
  client_id?: string;
  iat?: number;
}

/**
 * Verifies a one-time SSO handshake token minted by Base44's
 * issueCourseAccessToken function. Returns the embedded client_id if the
 * signature is valid, it hasn't expired, and it targets this site —
 * null otherwise.
 */
export async function verifySsoToken(token: string): Promise<string | null> {
  const secret = process.env.COURSE_ACCESS_TOKEN_SECRET;
  if (!secret) {
    console.error("COURSE_ACCESS_TOKEN_SECRET not configured");
    return null;
  }

  const [dataB64, sigB64] = token.split(".");
  if (!dataB64 || !sigB64) return null;

  const expectedSig = bytesToBase64Url(await hmacSha256(dataB64, secret));
  if (expectedSig !== sigB64) return null;

  let payload: SsoTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(dataB64)));
  } catch {
    return null;
  }

  if (!payload.client_id || payload.target !== SITE_TARGET) return null;
  if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) return null;

  return payload.client_id;
}

async function signSession(clientId: string): Promise<string> {
  const secret = process.env.LEARNING_SESSION_SECRET;
  if (!secret) throw new Error("LEARNING_SESSION_SECRET not configured");
  const payload: SessionPayload = { client_id: clientId, iat: Math.floor(Date.now() / 1000) };
  const dataB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sigB64 = bytesToBase64Url(await hmacSha256(dataB64, secret));
  return `${dataB64}.${sigB64}`;
}

async function verifySession(value: string): Promise<string | null> {
  const secret = process.env.LEARNING_SESSION_SECRET;
  if (!secret) return null;
  const [dataB64, sigB64] = value.split(".");
  if (!dataB64 || !sigB64) return null;
  const expectedSig = bytesToBase64Url(await hmacSha256(dataB64, secret));
  if (expectedSig !== sigB64) return null;
  try {
    const payload: SessionPayload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(dataB64)));
    return payload.client_id || null;
  } catch {
    return null;
  }
}

/** Builds the signed value to store in the session cookie for this client. */
export async function createSessionCookieValue(clientId: string): Promise<string> {
  return signSession(clientId);
}

/** Reads and verifies the current visitor's session cookie, server-side. */
export async function getSessionClientId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw);
}

/**
 * Live, server-to-server entitlement check against Base44 — never cached
 * here, and never trusted from anything the browser sends. Returns a
 * subset of ["pup_smart", "life_skills", "behaviour_toolbox",
 * "gundog_course"].
 */
export async function getEntitledCourses(clientId: string): Promise<string[]> {
  const apiKey = process.env.LEARNING_PLATFORM_API_KEY;
  if (!apiKey) {
    console.error("LEARNING_PLATFORM_API_KEY not configured");
    return [];
  }
  try {
    const res = await fetch(`${BASE44_APP_URL}/functions/checkCourseAccess`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ client_id: clientId }),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.entitled_courses) ? data.entitled_courses : [];
  } catch (err) {
    console.error("checkCourseAccess request failed", err);
    return [];
  }
}

/** Base44 client-portal URL to send someone to when they need to log in. */
export const BASE44_PORTAL_URL = `${BASE44_APP_URL}/portal`;
