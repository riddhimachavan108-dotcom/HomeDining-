"use client";

import { useActionState } from "react";
import { resolveGuestCode } from "@/lib/entry-actions";

export default function GuestCodeForm() {
  const [state, formAction, pending] = useActionState(resolveGuestCode, {});

  return (
    <form action={formAction} className="fd-form">
      <label className="fd-label" htmlFor="code">
        Enter your hotel&rsquo;s guest code
      </label>
      <input
        id="code"
        name="code"
        className="fd-input fd-input-code"
        placeholder="e.g. GRAND24"
        autoComplete="off"
        autoCapitalize="characters"
        autoFocus
        required
      />
      {state?.error && <div className="fd-error">{state.error}</div>}
      <button className="fd-btn fd-btn-primary" disabled={pending}>
        {pending ? "Checking…" : "Start ordering"}
      </button>
      <p className="fd-hint">You&rsquo;ll find this code in your room.</p>
    </form>
  );
}
