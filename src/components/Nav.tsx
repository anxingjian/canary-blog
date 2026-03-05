"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Journal", href: "/" },
  { label: "Essays", href: "/essays" },
  { label: "Arts", href: "/arts" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", gap: "0", marginBottom: "4rem" }}>
      {NAV_ITEMS.map((item, i) => {
        const active =
          item.href === "/"
            ? pathname === "/" || pathname.startsWith("/post/")
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            style={{
              flex: 1,
              padding: "1.25rem 0",
              textDecoration: "none",
              borderTop: active ? "2px solid var(--accent)" : "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              borderRight: i < NAV_ITEMS.length - 1 ? "1px solid var(--border)" : "none",
              display: "flex",
              alignItems: "baseline",
              gap: "0.5rem",
              transition: "all 0.2s",
            }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: active ? "1.75rem" : "1.25rem",
                color: active ? "var(--text-bright)" : "var(--text-dim)",
                transition: "all 0.2s",
                letterSpacing: "-0.02em",
              }}
            >
              {item.label}
            </span>
            {active && (
              <span
                style={{
                  fontSize: "0.5rem",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--accent)",
                  letterSpacing: "0.1em",
                }}
              >
                ●
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
