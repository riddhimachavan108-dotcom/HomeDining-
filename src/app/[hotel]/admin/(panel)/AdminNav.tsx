"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/${slug}/admin`;
  const tabs = [
    { href: base, label: "Orders" },
    { href: `${base}/menu`, label: "Menu" },
    { href: `${base}/settings`, label: "Branding" },
  ];

  return (
    <nav className="adm-nav">
      {tabs.map((t) => {
        const active =
          t.href === base ? pathname === base : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`adm-nav-tab${active ? " active" : ""}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
