"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/reset-actions";

export default function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  if (state?.sent) {
    return (
      <div className="fd-form">
        <div className="fd-ok">
          If that email is registered, we&rsquo;ve sent a reset link. Please
          check your inbox (and spam folder). The link expires in 45 minutes.
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="fd-form">
      <label className="fd-label" htmlFor="email">
        Your email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        className="fd-input"
        placeholder="The email you signed up with"
        autoComplete="email"
        autoFocus
        required
      />
      {state?.error && <div className="fd-error">{state.error}</div>}
      <button className="fd-btn fd-btn-dark" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
