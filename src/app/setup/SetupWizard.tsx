"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import {
  checkSlugAvailable,
  createHotelFromWizard,
  type WizardCategory,
} from "@/lib/onboarding-actions";

const MAX_IMG = 1_200_000; // 1.2 MB

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject("Please choose an image file.");
    if (file.size > MAX_IMG) return reject("Image must be under 1.2 MB.");
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject("Couldn't read that file.");
    r.readAsDataURL(file);
  });
}

const emptyItem = () => ({
  name: "",
  priceRupees: "",
  desc: "",
  veg: true,
  photoDataUrl: null as string | null,
});

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 — details
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [upiId, setUpiId] = useState("");
  const [themeColor, setThemeColor] = useState("#B8860B");
  const [accentColor, setAccentColor] = useState("#1a1a2e");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // Step 2 — menu
  const [categories, setCategories] = useState<WizardCategory[]>([
    { name: "", icon: "🍽️", items: [emptyItem()] },
  ]);

  // Step 3 — address + password
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugState, setSlugState] = useState<"idle" | "checking" | "ok" | "taken">(
    "idle"
  );
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const effectiveSlug = slugEdited ? slugify(slug) : slugify(name);

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setLogoDataUrl(await readImage(f));
    } catch (msg) {
      setError(String(msg));
    }
  }

  /* menu editing */
  const updateCat = (ci: number, patch: Partial<WizardCategory>) =>
    setCategories((cs) => cs.map((c, i) => (i === ci ? { ...c, ...patch } : c)));
  const addCat = () =>
    setCategories((cs) => [...cs, { name: "", icon: "🍽️", items: [emptyItem()] }]);
  const removeCat = (ci: number) =>
    setCategories((cs) => cs.filter((_, i) => i !== ci));
  const addItem = (ci: number) =>
    setCategories((cs) =>
      cs.map((c, i) => (i === ci ? { ...c, items: [...c.items, emptyItem()] } : c))
    );
  const updateItem = (
    ci: number,
    ii: number,
    patch: Partial<ReturnType<typeof emptyItem>>
  ) =>
    setCategories((cs) =>
      cs.map((c, i) =>
        i === ci
          ? { ...c, items: c.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) }
          : c
      )
    );
  const removeItem = (ci: number, ii: number) =>
    setCategories((cs) =>
      cs.map((c, i) =>
        i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c
      )
    );
  async function onItemPhoto(ci: number, ii: number, file?: File) {
    if (!file) return;
    try {
      updateItem(ci, ii, { photoDataUrl: await readImage(file) });
    } catch (msg) {
      setError(String(msg));
    }
  }

  async function verifySlug() {
    const s = effectiveSlug;
    if (!s) return setSlugState("idle");
    setSlugState("checking");
    const res = await checkSlugAvailable(s);
    setSlugState(res.available ? "ok" : "taken");
  }

  function goTo(next: number) {
    setError("");
    if (next === 2 && !name.trim()) {
      setError("Please enter your hotel name.");
      return;
    }
    if (next === 3) {
      if (!slugEdited) setSlug(slugify(name));
      verifySlug();
    }
    setStep(next);
  }

  async function submit() {
    setError("");
    if (!effectiveSlug) return setError("Please choose a web address.");
    if (slugState === "taken") return setError("That web address is taken.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    if (password !== password2) return setError("Passwords don't match.");

    setSubmitting(true);
    const res = await createHotelFromWizard({
      name,
      tagline,
      logoDataUrl,
      upiId,
      themeColor,
      accentColor,
      slug: effectiveSlug,
      password,
      categories,
    });
    if ("error" in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    router.push(`/${res.slug}/admin`);
  }

  const logoPreview = logoDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoDataUrl} alt="logo" />
  ) : (
    (name.slice(0, 2) || "H").toUpperCase()
  );

  return (
    <div className="wz" style={{ ["--primary" as string]: themeColor }}>
      <div className="wz-card">
        <div className="wz-steps">
          {["Hotel", "Menu", "Finish"].map((label, i) => (
            <div key={label} className={`wz-step${step === i + 1 ? " active" : ""}${step > i + 1 ? " done" : ""}`}>
              <span>{i + 1}</span> {label}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="wz-body">
            <h1 className="wz-h1">Set up your hotel</h1>
            <p className="wz-sub">This is what your guests will see.</p>

            <div className="wz-logo-row">
              <div className="wz-logo" style={{ background: themeColor }}>
                {logoPreview}
              </div>
              <label className="wz-file">
                Upload logo
                <input type="file" accept="image/*" hidden onChange={onLogo} />
              </label>
            </div>

            <label className="wz-label">Hotel name</label>
            <input
              className="wz-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Oberoi Grand"
            />

            <label className="wz-label">Tagline (optional)</label>
            <input
              className="wz-input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Fine dining, delivered to your door"
            />

            <label className="wz-label">UPI ID (where payments arrive)</label>
            <input
              className="wz-input"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. yourhotel@okhdfcbank"
            />

            <div className="wz-colors">
              <label className="wz-color">
                Brand colour
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                />
              </label>
              <label className="wz-color">
                Header colour
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
              </label>
            </div>

            {error && <div className="wz-error">{error}</div>}
            <button className="wz-next" onClick={() => goTo(2)}>
              Next: build your menu →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="wz-body">
            <h1 className="wz-h1">Build your menu</h1>
            <p className="wz-sub">
              Add your own categories and dishes. You can edit all of this later.
            </p>

            {categories.map((cat, ci) => (
              <div key={ci} className="wz-cat">
                <div className="wz-cat-head">
                  <input
                    className="wz-input wz-emoji"
                    value={cat.icon}
                    maxLength={2}
                    onChange={(e) => updateCat(ci, { icon: e.target.value })}
                  />
                  <input
                    className="wz-input"
                    value={cat.name}
                    onChange={(e) => updateCat(ci, { name: e.target.value })}
                    placeholder="Category (e.g. Breakfast, Main Menu, Sweets)"
                  />
                  {categories.length > 1 && (
                    <button className="wz-x" onClick={() => removeCat(ci)}>
                      ✕
                    </button>
                  )}
                </div>

                {cat.items.map((it, ii) => (
                  <div key={ii} className="wz-item">
                    <div className="wz-item-row">
                      <input
                        className="wz-input"
                        value={it.name}
                        onChange={(e) => updateItem(ci, ii, { name: e.target.value })}
                        placeholder="Dish name"
                      />
                      <input
                        className="wz-input wz-price"
                        type="number"
                        min="0"
                        value={it.priceRupees}
                        onChange={(e) =>
                          updateItem(ci, ii, { priceRupees: e.target.value })
                        }
                        placeholder="₹"
                      />
                    </div>
                    <input
                      className="wz-input"
                      value={it.desc}
                      onChange={(e) => updateItem(ci, ii, { desc: e.target.value })}
                      placeholder="Short description (optional)"
                    />
                    <div className="wz-item-foot">
                      <label className="wz-check">
                        <input
                          type="checkbox"
                          checked={it.veg}
                          onChange={(e) => updateItem(ci, ii, { veg: e.target.checked })}
                        />{" "}
                        Veg
                      </label>
                      <label className="wz-file wz-file-sm">
                        {it.photoDataUrl ? "✓ Photo" : "📷 Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => onItemPhoto(ci, ii, e.target.files?.[0])}
                        />
                      </label>
                      {cat.items.length > 1 && (
                        <button className="wz-x" onClick={() => removeItem(ci, ii)}>
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button className="wz-add-item" onClick={() => addItem(ci)}>
                  + Add dish
                </button>
              </div>
            ))}

            <button className="wz-add-cat" onClick={addCat}>
              + Add category
            </button>

            {error && <div className="wz-error">{error}</div>}
            <div className="wz-nav">
              <button className="wz-back" onClick={() => goTo(1)}>
                ← Back
              </button>
              <button className="wz-next" onClick={() => goTo(3)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="wz-body">
            <h1 className="wz-h1">Your address &amp; password</h1>
            <p className="wz-sub">
              Guests visit this link; you sign in with this password.
            </p>

            <label className="wz-label">Your hotel&rsquo;s web address</label>
            <div className="wz-slug">
              <span>/</span>
              <input
                className="wz-input"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(e.target.value);
                  setSlugState("idle");
                }}
                onBlur={verifySlug}
                placeholder="your-hotel"
              />
            </div>
            <div className="wz-slug-status">
              {slugState === "checking" && "Checking…"}
              {slugState === "ok" && <span className="ok">✓ Available</span>}
              {slugState === "taken" && (
                <span className="taken">Taken — try another</span>
              )}
            </div>

            <label className="wz-label">Dashboard password</label>
            <input
              className="wz-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
            />
            <label className="wz-label">Confirm password</label>
            <input
              className="wz-input"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Re-enter password"
            />

            {error && <div className="wz-error">{error}</div>}
            <div className="wz-nav">
              <button className="wz-back" onClick={() => goTo(2)}>
                ← Back
              </button>
              <button className="wz-next" onClick={submit} disabled={submitting}>
                {submitting ? "Creating…" : "Done — create my hotel"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
