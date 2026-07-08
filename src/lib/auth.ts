import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

// Simple signed-cookie session. One dashboard password per hotel (set during
// onboarding); the session carries the hotel id + slug, HMAC-signed with
// SESSION_SECRET so it can't be forged.

const COOKIE = "hd_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export type Role = "manager" | "staff";

type SessionPayload = {
  hotelId: string;
  slug: string;
  role: Role;
  exp: number;
};

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(
  payload: Omit<SessionPayload, "exp">
): string {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const body = b64url(JSON.stringify(full));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString()
    ) as SessionPayload;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getHotelSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Return the hotel AND role IF the current session is signed in for that slug.
 * Returns null otherwise (caller redirects to the login).
 */
export async function getAuthedHotel(slug: string) {
  const session = await getHotelSession();
  if (!session || session.slug !== slug) return null;
  const hotel = await prisma.hotel.findFirst({
    where: { id: session.hotelId, slug },
  });
  if (!hotel) return null;
  return { hotel, role: session.role };
}
