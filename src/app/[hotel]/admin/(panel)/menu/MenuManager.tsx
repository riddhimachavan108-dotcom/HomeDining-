"use client";

import { useState } from "react";
import {
  addCategory,
  updateCategory,
  deleteCategory,
  addItem,
  updateItem,
  deleteItem,
  toggleItemAvailable,
} from "@/lib/admin-actions";

type ItemData = {
  id: string;
  name: string;
  description: string;
  priceRupees: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string | null;
};
type CategoryData = {
  id: string;
  name: string;
  icon: string;
  items: ItemData[];
};

export default function MenuManager({
  slug,
  categories,
}: {
  slug: string;
  categories: CategoryData[];
}) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<string | null>(null);

  return (
    <div className="adm-menu">
      {/* Add category */}
      <form action={addCategory.bind(null, slug)} className="adm-card adm-add-cat">
        <span className="adm-add-cat-label">New category</span>
        <input
          name="icon"
          className="adm-input adm-input-emoji"
          placeholder="🍽️"
          defaultValue="🍽️"
          maxLength={2}
          aria-label="Category emoji"
        />
        <input
          name="name"
          className="adm-input"
          placeholder="e.g. Breakfast, Main Course, Beverages"
          required
        />
        <button className="adm-btn adm-btn-primary">Add category</button>
      </form>

      {categories.length === 0 && (
        <div className="adm-empty">
          No categories yet. Add your first one above to start building the menu.
        </div>
      )}

      {categories.map((cat) => (
        <section key={cat.id} className="adm-card adm-cat">
          <div className="adm-cat-head">
            {editingCat === cat.id ? (
              <form
                action={async (fd) => {
                  await updateCategory(slug, fd);
                  setEditingCat(null);
                }}
                className="adm-cat-edit"
              >
                <input type="hidden" name="id" value={cat.id} />
                <input
                  name="icon"
                  className="adm-input adm-input-emoji"
                  defaultValue={cat.icon}
                  maxLength={2}
                />
                <input
                  name="name"
                  className="adm-input"
                  defaultValue={cat.name}
                  required
                />
                <button className="adm-btn adm-btn-primary adm-btn-sm">Save</button>
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => setEditingCat(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h2 className="adm-cat-title">
                  <span className="adm-cat-emoji">{cat.icon}</span> {cat.name}
                  <span className="adm-cat-count">{cat.items.length} items</span>
                </h2>
                <div className="adm-cat-actions">
                  <button
                    className="adm-btn adm-btn-ghost adm-btn-sm"
                    onClick={() => setEditingCat(cat.id)}
                  >
                    Rename
                  </button>
                  <form
                    action={deleteCategory.bind(null, slug)}
                    onSubmit={(e) => {
                      if (
                        !confirm(
                          `Delete "${cat.name}" and all its items? This can't be undone.`
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={cat.id} />
                    <button className="adm-btn adm-btn-danger adm-btn-sm">
                      Delete
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Items */}
          <div className="adm-items">
            {cat.items.map((item) =>
              editingItem === item.id ? (
                <form
                  key={item.id}
                  action={async (fd) => {
                    await updateItem(slug, fd);
                    setEditingItem(null);
                  }}
                  className="adm-item-edit"
                >
                  <input type="hidden" name="id" value={item.id} />
                  <div className="adm-item-edit-row">
                    <input
                      name="name"
                      className="adm-input"
                      defaultValue={item.name}
                      placeholder="Dish name"
                      required
                    />
                    <input
                      name="price"
                      className="adm-input adm-input-price"
                      type="number"
                      step="1"
                      min="0"
                      defaultValue={item.priceRupees}
                      placeholder="Price ₹"
                      required
                    />
                  </div>
                  <input
                    name="description"
                    className="adm-input"
                    defaultValue={item.description}
                    placeholder="Short description"
                  />
                  <label className="adm-check">
                    <input
                      type="checkbox"
                      name="isVeg"
                      defaultChecked={item.isVeg}
                    />{" "}
                    Vegetarian
                  </label>
                  <div className="adm-photo-edit">
                    <label className="adm-photo-btn">
                      📷 {item.imageUrl ? "Replace photo" : "Add photo"}
                      <input type="file" name="photo" accept="image/*" hidden />
                    </label>
                    {item.imageUrl && (
                      <label className="adm-check">
                        <input type="checkbox" name="removePhoto" /> Remove photo
                      </label>
                    )}
                  </div>
                  <div className="adm-item-edit-actions">
                    <button className="adm-btn adm-btn-primary adm-btn-sm">
                      Save
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      onClick={() => setEditingItem(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  key={item.id}
                  className={`adm-item${item.isAvailable ? "" : " unavailable"}`}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="adm-item-thumb"
                      src={item.imageUrl}
                      alt={item.name}
                    />
                  ) : (
                    <span
                      className={`hd-veg-badge ${item.isVeg ? "veg" : "nonveg"}`}
                    />
                  )}
                  <div className="adm-item-info">
                    <div className="adm-item-name">{item.name}</div>
                    {item.description && (
                      <div className="adm-item-desc">{item.description}</div>
                    )}
                  </div>
                  <div className="adm-item-price">₹{item.priceRupees}</div>
                  <div className="adm-item-actions">
                    <form action={toggleItemAvailable.bind(null, slug)}>
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="hidden"
                        name="available"
                        value={(!item.isAvailable).toString()}
                      />
                      <button
                        className={`adm-btn adm-btn-sm ${
                          item.isAvailable ? "adm-btn-ghost" : "adm-btn-primary"
                        }`}
                        title={
                          item.isAvailable
                            ? "Mark as sold out"
                            : "Mark as available"
                        }
                      >
                        {item.isAvailable ? "In stock" : "Sold out"}
                      </button>
                    </form>
                    <button
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      onClick={() => setEditingItem(item.id)}
                    >
                      Edit
                    </button>
                    <form
                      action={deleteItem.bind(null, slug)}
                      onSubmit={(e) => {
                        if (!confirm(`Delete "${item.name}"?`))
                          e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <button className="adm-btn adm-btn-danger adm-btn-sm">
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Add item to this category */}
          <form
            action={addItem.bind(null, slug)}
            className="adm-add-item"
          >
            <input type="hidden" name="categoryId" value={cat.id} />
            <div className="adm-add-item-row">
              <input
                name="name"
                className="adm-input"
                placeholder="Dish name"
                required
              />
              <input
                name="price"
                className="adm-input adm-input-price"
                type="number"
                step="1"
                min="0"
                placeholder="₹"
                required
              />
            </div>
            <input
              name="description"
              className="adm-input"
              placeholder="Short description (optional)"
            />
            <div className="adm-add-item-foot">
              <label className="adm-check">
                <input type="checkbox" name="isVeg" defaultChecked /> Vegetarian
              </label>
              <label className="adm-photo-btn">
                📷 Photo
                <input type="file" name="photo" accept="image/*" hidden />
              </label>
              <button className="adm-btn adm-btn-primary adm-btn-sm">
                + Add dish
              </button>
            </div>
          </form>
        </section>
      ))}
    </div>
  );
}
