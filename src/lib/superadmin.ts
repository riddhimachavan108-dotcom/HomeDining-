import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

// Super-admin (platform owner) session. Access is gated by the
// SUPER_ADMIN_PASSWORD env var — never stored in the database or code.

const COOKIE = "hd_super";
const MAX_AGE = 60 * 60 * 6; // 6 hours

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret";
}
function sign(data: string): string {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

export function checkSuperPassword(password: string): boolean {
  const expected = process.env.SUPER_ADMIN_PASSWORD || "";
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createSuperToken(): string {
  const body = Buffer.from(
    JSON.stringify({ s: true, exp: Math.floor(Date.now() / 1000) + MAX_AGE })
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export async function isSuperAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = sign(body);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return false;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload.s === true && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function setSuperCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}
export async function clearSuperCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** The single platform-settings row (created with defaults if missing). */
export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: "platform" },
    update: {},
    create: { id: "platform" },
  });
}
