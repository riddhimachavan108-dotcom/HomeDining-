"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { sendMail, mailerConfigured } from "./mailer";

const RESET_TTL_MIN = 45;
const APP_URL = (
  process.env.APP_URL || "https://home-dining-frvl.vercel.app"
).replace(/\/$/, "");

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Step 1 of reset: the manager enters their email. If it matches a hotel, we
 * store a one-time token (hashed) and email a reset link. The response is
 * always generic so we never reveal whether an email is registered.
 */
export async function requestPasswordReset(
  _prev: { sent?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ sent?: boolean; error?: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Please enter your email address." };

  const hotels = await prisma.hotel.findMany({
    where: { managerEmail: { equals: email, mode: "insensitive" } },
  });

  for (const h of hotels) {
    const raw = crypto.randomBytes(32).toString("hex");
    await prisma.hotel.update({
      where: { id: h.id },
      data: {
        resetTokenHash: hashToken(raw),
        resetTokenExpiresAt: new Date(Date.now() + RESET_TTL_MIN * 60_000),
      },
    });
    const link = `${APP_URL}/reset?token=${raw}`;
    if (mailerConfigured()) {
      try {
        await sendMail(
          email,
          "Reset your Home Dining password",
          `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222">
             <p>Hello,</p>
             <p>We received a request to reset the manager password for
             <strong>${h.name}</strong> on Home Dining.</p>
             <p><a href="${link}" style="display:inline-block;background:#b8860b;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Reset my password</a></p>
             <p>Or paste this link into your browser:<br>${link}</p>
             <p>This link expires in ${RESET_TTL_MIN} minutes. If you didn't request this, you can ignore this email.</p>
             <p>— Home Dining</p>
           </div>`
        );
      } catch (e) {
        // Don't leak details to the user; log for the operator.
        console.error("Password reset email failed:", e);
      }
    }
  }

  return { sent: true };
}

/** Step 2 of reset: verify the token and set a new manager password. */
export async function completePasswordReset(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const password2 = String(formData.get("password2") || "");

  if (!token) return { error: "This reset link is invalid." };
  if (password.length < 4)
    return { error: "Your new password must be at least 4 characters." };
  if (password !== password2) return { error: "Passwords don't match." };

  const hotel = await prisma.hotel.findFirst({
    where: {
      resetTokenHash: hashToken(token),
      resetTokenExpiresAt: { gt: new Date() },
    },
  });
  if (!hotel) {
    return { error: "This reset link is invalid or has expired." };
  }

  await prisma.hotel.update({
    where: { id: hotel.id },
    data: {
      passwordHash: await bcrypt.hash(password, 10),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });

  redirect("/login?reset=1");
}
