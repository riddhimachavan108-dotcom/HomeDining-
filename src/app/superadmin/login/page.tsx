import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isSuperAdmin } from "@/lib/superadmin";
import SuperLoginForm from "./SuperLoginForm";

export const metadata: Metadata = { title: "Super Admin — Home Dining" };

export default async function SuperLoginPage() {
  if (await isSuperAdmin()) redirect("/superadmin");
  return (
    <div className="fd">
      <div className="fd-card">
        <div className="fd-brand-sm">🛎️ Home Dining</div>
        <h1 className="fd-title">Super Admin</h1>
        <p className="fd-sub-sm">Platform owner access only.</p>
        <SuperLoginForm />
      </div>
    </div>
  );
}
