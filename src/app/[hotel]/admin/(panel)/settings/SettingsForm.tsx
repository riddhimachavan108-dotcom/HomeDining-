"use client";

import { useActionState, useState } from "react";
import { updateBranding } from "@/lib/admin-actions";

type HotelBranding = {
  slug: string;
  name: string;
  tagline: string;
  logoText: string | null;
  logoUrl: string | null;
  upiId: string | null;
  razorpayKeyId: string | null;
  hasRzpSecret: boolean;
  themeColor: string;
  accentColor: string;
  etaMinutes: string;
  gstPercent: number;
};

export default function SettingsForm({ hotel }: { hotel: HotelBranding }) {
  const action = updateBranding.bind(null, hotel.slug);
  const [state, formAction, pending] = useActionState(action, {});

  // Live logo preview: the newly-chosen file, else the saved logo, else monogram.
  const [previewUrl, setPreviewUrl] = useState<string | null>(hotel.logoUrl);
  const [name, setName] = useState(hotel.name);
  const [monogram, setMonogram] = useState(hotel.logoText ?? "");
  const [remove, setRemove] = useState(false);
  const [theme, setTheme] = useState(hotel.themeColor);
  const [accent, setAccent] = useState(hotel.accentColor);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemove(false);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const showImage = previewUrl && !remove;
  const monogramText =
    (monogram || name.slice(0, 2) || "H").toUpperCase();

  return (
    <form action={formAction} className="adm-card adm-settings">
      {/* Logo */}
      <div className="adm-field">
        <label className="adm-label">Logo</label>
        <div className="adm-logo-editor">
          <div
            className="adm-logo-preview"
            style={{ background: theme }}
            aria-hidden
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl!} alt="Logo preview" />
            ) : (
              monogramText
            )}
          </div>
          <div className="adm-logo-controls">
            <label className="adm-btn adm-btn-ghost adm-btn-sm adm-file-btn">
              Upload logo image
              <input
                type="file"
                name="logoFile"
                accept="image/*"
                onChange={onPickFile}
                hidden
              />
            </label>
            <span className="adm-hint">PNG, JPG or SVG. Square works best, under 1 MB.</span>
            {hotel.logoUrl && (
              <label className="adm-check">
                <input
                  type="checkbox"
                  name="removeLogo"
                  checked={remove}
                  onChange={(e) => setRemove(e.target.checked)}
                />{" "}
                Remove logo image (use monogram instead)
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="adm-field">
        <label className="adm-label">Hotel name</label>
        <input
          name="name"
          className="adm-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="adm-field">
        <label className="adm-label">Tagline</label>
        <input
          name="tagline"
          className="adm-input"
          defaultValue={hotel.tagline}
          placeholder="e.g. Fine dining, delivered to your door"
        />
      </div>

      <div className="adm-field">
        <label className="adm-label">UPI ID (where guest payments go)</label>
        <input
          name="upiId"
          className="adm-input"
          defaultValue={hotel.upiId ?? ""}
          placeholder="e.g. hotelname@okhdfcbank"
        />
        <span className="adm-hint">
          Used only if online payment (below) is not set up.
        </span>
      </div>

      <div className="adm-field">
        <label className="adm-label">
          Online payment — Razorpay Key ID (auto-confirms real payments)
        </label>
        <input
          name="razorpayKeyId"
          className="adm-input"
          defaultValue={hotel.razorpayKeyId ?? ""}
          placeholder="rzp_test_XXXXXXXX or rzp_live_XXXXXXXX"
        />
        <label className="adm-label" style={{ marginTop: 10 }}>
          Razorpay Key Secret
        </label>
        <input
          name="razorpayKeySecret"
          type="password"
          className="adm-input"
          placeholder={
            hotel.hasRzpSecret
              ? "•••••••• (saved — leave blank to keep)"
              : "Paste your Razorpay key secret"
          }
          autoComplete="new-password"
        />
        <span className="adm-hint">
          {hotel.razorpayKeyId && hotel.hasRzpSecret
            ? "✓ Online payment is ON — guests pay by UPI and the order confirms automatically."
            : "Add both keys to turn on “Pay Now”. Get them free at dashboard.razorpay.com."}
        </span>
      </div>

      <div className="adm-field">
        <label className="adm-label">Logo monogram (fallback when there's no image)</label>
        <input
          name="logoText"
          className="adm-input adm-input-emoji"
          value={monogram}
          onChange={(e) => setMonogram(e.target.value)}
          placeholder="GM"
          maxLength={3}
        />
      </div>

      <div className="adm-grid-2">
        <div className="adm-field">
          <label className="adm-label">Brand colour (buttons, highlights)</label>
          <div className="adm-color-row">
            <input
              type="color"
              name="themeColor"
              className="adm-color"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
            <span className="adm-hint">{theme}</span>
          </div>
        </div>
        <div className="adm-field">
          <label className="adm-label">Header colour (top bar, hero)</label>
          <div className="adm-color-row">
            <input
              type="color"
              name="accentColor"
              className="adm-color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
            />
            <span className="adm-hint">{accent}</span>
          </div>
        </div>
      </div>

      <div className="adm-grid-2">
        <div className="adm-field">
          <label className="adm-label">Estimated delivery (minutes)</label>
          <input
            name="etaMinutes"
            className="adm-input"
            defaultValue={hotel.etaMinutes}
            placeholder="20–35"
          />
        </div>
        <div className="adm-field">
          <label className="adm-label">GST %</label>
          <input
            name="gstPercent"
            type="number"
            min="0"
            max="28"
            className="adm-input"
            defaultValue={hotel.gstPercent}
          />
        </div>
      </div>

      {state?.error && <div className="adm-form-error">{state.error}</div>}
      {state?.ok && <div className="adm-form-ok">Saved. Your guest site is updated.</div>}

      <button className="adm-btn adm-btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
