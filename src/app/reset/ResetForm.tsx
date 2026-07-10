"use client";

import { useActionState } from "react";
import { completePasswordReset } from "@/lib/reset-actions";

export default function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(completePasswordReset, {});

  return (
    <form action={formAction} className="fd-form">
      <input type="hidden" name="token" value={token} />
      <label className="fd-label" htmlFor="password">
        New manager password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="fd-input"
        placeholder="Choose a new password"
        autoComplete="new-password"
        autoFocus
        required
      />
      <label className="fd-label" htmlFor="password2">
        Confirm new password
      </label>
      <input
        id="password2"
        name="password2"
        type="password"
        className="fd-input"
        placeholder="Re-enter new password"
        autoComplete="new-password"
        required
      />
      {state?.error && <div className="fd-error">{state.error}</div>}
      <button className="fd-btn fd-btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
