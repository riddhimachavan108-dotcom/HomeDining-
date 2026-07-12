"use client";

import { useActionState } from "react";
import type { Role } from "@/lib/auth";
import { roleLogin } from "@/lib/entry-actions";

export default function RoleLoginForm({ role }: { role: Role }) {
  const action = roleLogin.bind(null, role);
  const [state, formAction, pending] = useActionState(action, {});
  const isManager = role === "manager";

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
        {isManager ? "Manager password" : "Staff password"}
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="fd-input"
        placeholder={isManager ? "Your manager password" : "Your staff password"}
        autoComplete="current-password"
        required
      />

      {state?.error && <div className="fd-error">{state.error}</div>}
      <button
        className={`fd-btn ${isManager ? "fd-btn-dark" : "fd-btn-primary"}`}
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
