"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPaise } from "@/lib/money";
import { createOrder } from "@/lib/order-actions";

export type MenuItemData = {
  id: string;
  name: string;
  desc: string;
  priceInPaise: number;
  veg: boolean;
  available: boolean;
  imageUrl: string | null;
};
export type CategoryData = {
  id: string;
  name: string;
  icon: string;
  items: MenuItemData[];
};
export type HotelData = {
  slug: string;
  name: string;
  tagline: string;
  logoText: string | null;
  logoUrl: string | null;
  themeColor: string;
  etaMinutes: string;
  gstPercent: number;
  categories: CategoryData[];
};

type CartLine = { item: MenuItemData; qty: number };
type Cart = Record<string, CartLine>;

export default function MenuOrder({ hotel }: { hotel: HotelData }) {
  const router = useRouter();
  const storageKey = `hd_cart_${hotel.slug}`;

  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(hotel.categories[0]?.id ?? "");
  const [room, setRoom] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, storageKey]);

  const lines = Object.values(cart);
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.item.priceInPaise * l.qty, 0);
  const tax = Math.round((subtotal * hotel.gstPercent) / 100);
  const total = subtotal + tax;

  function addItem(item: MenuItemData) {
    setCart((c) => {
      const existing = c[item.id];
      return { ...c, [item.id]: { item, qty: existing ? existing.qty + 1 : 1 } };
    });
  }
  function removeItem(id: string) {
    setCart((c) => {
      const existing = c[id];
      if (!existing) return c;
      const qty = existing.qty - 1;
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = { ...existing, qty };
      return next;
    });
  }

  function scrollToCat(id: string) {
    setActiveCat(id);
    document
      .getElementById(`sec-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function completeOrder() {
    if (placing) return;
    setError("");
    if (!room.trim()) {
      setError("Please enter your room number to continue.");
      return;
    }
    setPlacing(true);
    const payload = lines.map((l) => ({ id: l.item.id, qty: l.qty }));
    const res = await createOrder(hotel.slug, room, payload);
    if ("error" in res) {
      setError(res.error);
      setPlacing(false);
      return;
    }
    setCart({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    router.push(`/${hotel.slug}/order/${res.orderId}`);
  }

  const logo = hotel.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={hotel.logoUrl} alt={hotel.name} />
  ) : (
    (hotel.logoText ?? hotel.name.slice(0, 2)).toUpperCase()
  );

  return (
    <>
      <header className="hd-header">
        <div className="hd-header-inner">
          <Link
            href={`/${hotel.slug}`}
            className="hd-logo-area"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="hd-logo-circle">{logo}</div>
            <div className="hd-hotel-info">
              <span className="hd-hotel-name">{hotel.name}</span>
              <span className="hd-hotel-tagline">{hotel.tagline}</span>
            </div>
          </Link>
        </div>
      </header>

      {/* CATEGORY TABS */}
      <nav className="hd-category-nav">
        {hotel.categories.map((cat) => (
          <button
            key={cat.id}
            className={`hd-cat-tab${activeCat === cat.id ? " active" : ""}`}
            onClick={() => scrollToCat(cat.id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </nav>

      {/* MENU */}
      <main className="hd-menu-container">
        {hotel.categories.length === 0 && (
          <div className="hd-menu-empty">
            This menu is being set up. Please check back shortly.
          </div>
        )}
        {hotel.categories.map((cat) => (
          <section key={cat.id} id={`sec-${cat.id}`} className="hd-menu-section">
            <h2 className="hd-section-heading">
              <span>{cat.icon}</span> {cat.name}
            </h2>
            <div className="hd-menu-grid">
              {cat.items.map((item) => {
                const line = cart[item.id];
                return (
                  <div
                    key={item.id}
                    className={`hd-menu-card${item.available ? "" : " unavailable"}${
                      item.imageUrl ? " has-photo" : ""
                    }`}
                  >
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="hd-card-photo"
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                      />
                    )}
                    <div className="hd-card-body">
                      <div className="hd-card-top">
                        <span className="hd-item-name">{item.name}</span>
                        <span
                          className={`hd-veg-badge ${item.veg ? "veg" : "nonveg"}`}
                        />
                      </div>
                      {item.desc && <p className="hd-item-desc">{item.desc}</p>}
                      <div className="hd-card-bottom">
                        <span className="hd-item-price">
                          {formatPaise(item.priceInPaise)}
                        </span>
                        {!item.available ? (
                          <span className="hd-sold-out">Sold out</span>
                        ) : line ? (
                          <div className="hd-qty-box">
                            <button
                              className="hd-qty-btn"
                              onClick={() => removeItem(item.id)}
                            >
                              −
                            </button>
                            <span className="hd-qty-num">{line.qty}</span>
                            <button
                              className="hd-qty-btn"
                              onClick={() => addItem(item)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="hd-add-btn"
                            onClick={() => addItem(item)}
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* CART FAB */}
      {totalQty > 0 && (
        <button className="hd-cart-fab" onClick={() => setCartOpen(true)}>
          🛒 Go to Cart &nbsp;
          <span className="hd-cart-count">{totalQty}</span>
        </button>
      )}

      {/* CART */}
      {cartOpen && (
        <>
          <div className="hd-cart-overlay" onClick={() => setCartOpen(false)} />
          <aside className="hd-cart-sidebar">
            <div className="hd-cart-header">
              <h2>Your Order</h2>
              <button
                className="hd-close-cart"
                onClick={() => setCartOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="hd-cart-items">
              {lines.length === 0 ? (
                <div className="hd-cart-empty">
                  <span>🍽️</span>
                  <p>Your cart is empty</p>
                  <small>Add items from the menu to get started</small>
                </div>
              ) : (
                <>
                  {/* Room number — collected here, before completing the order */}
                  <div className="hd-room-field">
                    <label htmlFor="room">Delivering to which room?</label>
                    <input
                      id="room"
                      className="hd-room-input"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="Enter your room number"
                      inputMode="text"
                      autoComplete="off"
                    />
                  </div>

                  {lines.map(({ item, qty }) => (
                    <div key={item.id} className="hd-cart-item">
                      <div className="hd-cart-item-info">
                        <div className="hd-cart-item-name">{item.name}</div>
                        <div className="hd-cart-item-price">
                          {formatPaise(item.priceInPaise)} × {qty} ={" "}
                          {formatPaise(item.priceInPaise * qty)}
                        </div>
                      </div>
                      <div className="hd-cart-item-control">
                        <button
                          className="hd-ci-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          −
                        </button>
                        <span className="hd-ci-num">{qty}</span>
                        <button
                          className="hd-ci-btn"
                          onClick={() => addItem(item)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {lines.length > 0 && (
              <div className="hd-cart-footer">
                <div className="hd-price-row">
                  <span>Subtotal</span>
                  <span>{formatPaise(subtotal)}</span>
                </div>
                <div className="hd-price-row">
                  <span>GST ({hotel.gstPercent}%)</span>
                  <span>{formatPaise(tax)}</span>
                </div>
                <div className="hd-price-row hd-total-row">
                  <span>Total</span>
                  <span>{formatPaise(total)}</span>
                </div>
                {error && <div className="hd-order-error">{error}</div>}
                <button
                  className="hd-place-order-btn"
                  onClick={completeOrder}
                  disabled={placing}
                >
                  {placing ? "Placing your order…" : "Complete the Order"}
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
