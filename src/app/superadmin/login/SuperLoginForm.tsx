"use client";

import { useActionState } from "react";
import { loginSuperAdmin } from "@/lib/superadmin-actions";

export default function SuperLoginForm() {
  const [state, formAction, pending] = useActionState(loginSuperAdmin, {});
  return (
    <form action={formAction} className="fd-form">
      <label className="fd-label" htmlFor="password">
        Super-admin password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="fd-input"
        placeholder="Enter password"
        autoComplete="current-password"
        autoFocus
        required
      />
      {state?.error && <div className="fd-error">{state.error}</div>}
      <button className="fd-btn fd-btn-dark" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
