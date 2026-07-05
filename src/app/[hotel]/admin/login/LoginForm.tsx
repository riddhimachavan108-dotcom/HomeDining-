"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/admin-auth-actions";

export default function LoginForm({ slug }: { slug: string }) {
  const action = loginAction.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="adm-auth-form">
      <label className="adm-label" htmlFor="password">
        Dashboard password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="adm-input"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />

      {state?.error && <div className="adm-form-error">{state.error}</div>}

      <button className="adm-btn adm-btn-primary adm-btn-block" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
