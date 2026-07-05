"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "./auth";

export async function loginAction(
  slug: string,
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") || "");
  if (!password) return { error: "Enter your dashboard password." };

  const hotel = await prisma.hotel.findFirst({ where: { slug } });
  if (!hotel || !hotel.passwordHash) {
    return { error: "This hotel isn't set up yet." };
  }
  if (!(await bcrypt.compare(password, hotel.passwordHash))) {
    return { error: "Incorrect password." };
  }

  const token = createSessionToken({ hotelId: hotel.id, slug });
  await setSessionCookie(token);
  redirect(`/${slug}/admin`);
}

export async function logoutAction(slug: string) {
  await clearSessionCookie();
  redirect(`/${slug}/admin/login`);
}
