"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Role, useStore } from "@/lib/store";
import { TIERS } from "@/lib/tiers";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles?: Role[];
}

export const NAV: NavItem[] = [
  { href: "/", label: "Startsida", icon: "🏠" },
  { href: "/arskurs", label: "Välj årskurs", icon: "🎓" },
  { href: "/videolektioner", label: "Videolektioner", icon: "🎥" },
  { href: "/ovningar", label: "Matematikövningar", icon: "✏️" },
  { href: "/screening", label: "Screening", icon: "🧠" },
  { href: "/quiz", label: "Quiz och utmaningar", icon: "🏆" },
  { href: "/resultat", label: "Mina resultat", icon: "📊" },
  { href: "/foraldraportal", label: "Föräldraportal", icon: "👨‍👩‍👧", roles: ["foralder", "admin"] },
  { href: "/abonnemang", label: "Mitt abonnemang", icon: "💳", roles: ["foralder", "admin"] },
  { href: "/larare", label: "Lärarvy", icon: "🧑‍🏫", roles: ["admin"] },
];

const ROLE_LABEL: Record<Role, string> = { elev: "Elev", foralder: "Förälder", admin: "Lärare (admin)" };

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, update, logout, currentStudent, tier } = useStore();
  const [open, setOpen] = useState(false);
  const role = state.session?.role;

  const items = NAV.filter((n) => !n.roles || !role || n.roles.includes(role));
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy font-serif text-lg font-bold text-gold sm:h-10 sm:w-10">π</span>
          <span className="font-serif text-lg font-bold text-navy sm:text-xl">
            Matte<span className="text-wine">portalen</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => update((s) => ({ ...s, textSize: s.textSize === "stor" ? "normal" : "stor" }))}
            className="hidden rounded-lg border border-line px-2.5 py-1 text-sm font-semibold text-navy hover:bg-gold-light sm:inline-block"
            aria-label="Ändra textstorlek"
            title="Ändra textstorlek"
          >
            {state.textSize === "stor" ? "A−" : "A+"}
          </button>
          {role ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-right text-sm leading-tight">
                <span className="block font-semibold text-navy">
                  {role === "elev" ? currentStudent?.name : role === "foralder" ? state.parent.name : "Lärare"}
                </span>
                <span className="text-muted">
                  {ROLE_LABEL[role]} · {TIERS[tier].name}
                </span>
              </span>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="btn-ghost !px-3 !py-1.5 text-sm"
              >
                Logga ut
              </button>
            </div>
          ) : (
            <Link href="/logga-in" className="btn-primary whitespace-nowrap !px-3 sm:!px-4 !py-1.5 text-sm">
              Logga in
            </Link>
          )}
          <button className="rounded-lg border border-line px-2.5 py-1 text-navy lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Meny">
            ☰
          </button>
        </div>
      </div>

      <nav className={`${open ? "block" : "hidden"} border-t border-line lg:block`}>
        <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2 lg:flex-row lg:flex-wrap lg:gap-1">
          {items.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(n.href) ? "bg-navy text-white" : "text-navy hover:bg-gold-light"
                }`}
              >
                <span aria-hidden>{n.icon}</span>
                {n.label}
              </Link>
            </li>
          ))}
          <li className="sm:hidden">
            <button
              onClick={() => update((s) => ({ ...s, textSize: s.textSize === "stor" ? "normal" : "stor" }))}
              className="w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium text-navy"
            >
              {state.textSize === "stor" ? "A− Mindre text" : "A+ Större text"}
            </button>
          </li>
          {role && (
            <li className="sm:hidden">
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  router.push("/");
                }}
                className="w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium text-wine"
              >
                Logga ut
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
