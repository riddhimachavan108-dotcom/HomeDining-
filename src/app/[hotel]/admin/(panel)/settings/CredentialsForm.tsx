"use client";

import { useActionState } from "react";
import { updateCredentials } from "@/lib/admin-actions";

export default function CredentialsForm({
  slug,
  guestCode,
}: {
  slug: string;
  guestCode: string;
}) {
  const action = updateCredentials.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="adm-card adm-settings">
      <div className="adm-field">
        <label className="adm-label">Guest code</label>
        <input
          name="guestCode"
          className="adm-input"
          defaultValue={guestCode}
          placeholder="e.g. GRAND24"
          style={{ textTransform: "uppercase" }}
        />
        <span className="adm-hint">
          Guests type this to reach your menu. Write it in every room.
        </span>
      </div>

      <div className="adm-grid-2">
        <div className="adm-field">
          <label className="adm-label">New manager password</label>
          <input
            name="managerPassword"
            type="password"
            className="adm-input"
            placeholder="Leave blank to keep current"
            autoComplete="new-password"
          />
          <span className="adm-hint">Full dashboard access.</span>
        </div>
        <div className="adm-field">
          <label className="adm-label">New staff password</label>
          <input
            name="staffPassword"
            type="password"
            className="adm-input"
            placeholder="Leave blank to keep current"
            autoComplete="new-password"
          />
          <span className="adm-hint">Orders view only.</span>
        </div>
      </div>

      {state?.error && <div className="adm-form-error">{state.error}</div>}
      {state?.ok && <div className="adm-form-ok">Saved.</div>}

      <button className="adm-btn adm-btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Update codes & passwords"}
      </button>
    </form>
  );
}
