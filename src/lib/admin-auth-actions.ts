"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie } from "./auth";

export async function logoutAction(_slug?: string) {
  await clearSessionCookie();
  redirect(`/login`);
}
