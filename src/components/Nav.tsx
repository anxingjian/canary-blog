"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "01", name: "journal", href: "/journal" },
  { label: "02", name: "essays", href: "/essays" },
  { label: "03", name: "readings", href: "/readings" },
  { label: "04", name: "arts", href: "/arts" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: "0",
        marginBottom: "3rem",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/journal"
            ? pathname === "/journal" || pathname.startsWith("/post/")
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            style={{
              padding: "1rem 2rem 1rem 0",
              textDecoration: "none",
              display: "flex",
              alignItems: "baseline",
              gap: "0.75rem",
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.5rem",
                color: active ? "var(--accent)" : "var(--text-dim)",
                letterSpacing: "0.1em",
                transition: "color 0.2s",
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.75rem",
                color: active ? "var(--text-bright)" : "var(--text-dim)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                transition: "color 0.2s",
              }}
            >
              {item.name}
            </span>
            {active && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "var(--accent)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
