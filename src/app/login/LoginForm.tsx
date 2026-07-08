"use client";

import { useActionState } from "react";
import { managerStaffLogin } from "@/lib/entry-actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(managerStaffLogin, {});

  return (
    <form action={formAction} className="fd-form">
      <label className="fd-label" htmlFor="hotelName">
        Hotel name
      </label>
      <input
        id="hotelName"
        name="hotelName"
        className="fd-input"
        placeholder="Your hotel name"
        autoComplete="off"
        autoFocus
        required
      />

      <label className="fd-label" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="fd-input"
        placeholder="Manager or staff password"
        autoComplete="current-password"
        required
      />

      {state?.error && <div className="fd-error">{state.error}</div>}
      <button className="fd-btn fd-btn-dark" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
