import Link from "next/link";
import type { ReactNode } from "react";
import { Mark } from "@/components/Mark";

const NAV = [
  { href: "/#directory", label: "Directory" },
  { href: "/qr", label: "QR Plates" },
  { href: "/scan", label: "Scan QR" },
  { href: "/#gabay", label: "Ask Gabay" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-stretch gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2.5 py-3 pr-5 sm:border-r-2 sm:border-ink"
        >
          <Mark className="h-8 w-8 shrink-0" />
          <span className="leading-none">
            <span className="display-tight block text-[1.45rem] font-black">
              GABAY
            </span>
            <span className="label block text-[0.55rem] text-warm">
              AR Campus Assistant
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="focus-ring label text-ink/70 transition-colors hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/static/index.html"
            className="focus-ring hud-btn hidden border-2 border-ink px-4 py-2 text-[0.8rem] font-bold tracking-wide lg:block"
          >
            HTML / CSS / JS
          </Link>
          <Link
            href="/scan"
            className="focus-ring hud-btn hidden border-2 border-ink px-4 py-2 text-[0.8rem] font-bold tracking-wide sm:block"
          >
            Scan QR
          </Link>
          <Link
            href="/ar"
            className="focus-ring hud-btn bg-navy px-4 py-2.5 text-[0.8rem] font-extrabold tracking-wide text-white shadow-[3px_3px_0_0_#0e1633] sm:px-5"
          >
            START AR →
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-[1400px] px-4 sm:px-6 ${className}`}>
      {children}
    </section>
  );
}
