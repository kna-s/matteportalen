"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Role, useStore } from "@/lib/store";
import { TIERS } from "@/lib/tiers";
import DemoBar from "./DemoBar";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: Role[];
  /** Visas i mobilens bottenmeny. */
  mobile?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const ALL: Role[] = ["elev", "foralder", "admin"];
const ADULT: Role[] = ["foralder", "admin"];

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Lära",
    items: [
      { href: "/", label: "Startsida", icon: "🏠", roles: ALL, mobile: true },
      { href: "/arskurs", label: "Välj årskurs", icon: "🎓", roles: ALL },
      { href: "/videolektioner", label: "Videolektioner", icon: "🎥", roles: ALL, mobile: true },
      { href: "/ovningar", label: "Matematikövningar", icon: "✏️", roles: ALL, mobile: true },
      { href: "/quiz", label: "Quiz och utmaningar", icon: "🏆", roles: ALL, mobile: true },
    ],
  },
  {
    title: "Uppföljning",
    items: [
      { href: "/screening", label: "Screening", icon: "🧠", roles: ALL },
      { href: "/resultat", label: "Mina resultat", icon: "📊", roles: ALL },
    ],
  },
  {
    title: "Konto",
    items: [
      { href: "/foraldraportal", label: "Föräldraportal", icon: "👨‍👩‍👧", roles: ADULT },
      { href: "/abonnemang", label: "Mitt abonnemang", icon: "💳", roles: ADULT },
      { href: "/larare", label: "Lärarvy", icon: "🧑‍🏫", roles: ["admin"] },
    ],
  },
];

const ROLE_LABEL: Record<Role, string> = { elev: "Elev", foralder: "Förälder", admin: "Lärare" };

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy font-serif text-lg font-bold text-gold">π</span>
      {!compact && (
        <span className="truncate font-serif text-lg font-bold text-navy">
          Matte<span className="text-wine">portalen</span>
        </span>
      )}
    </Link>
  );
}

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

function TextSizeButton() {
  const { state, update } = useStore();
  return (
    <button
      onClick={() => update((s) => ({ ...s, textSize: s.textSize === "stor" ? "normal" : "stor" }))}
      className="rounded-lg border border-line bg-paper px-2.5 py-1 text-sm font-semibold text-navy hover:bg-gold-light"
      aria-label="Ändra textstorlek"
      title="Ändra textstorlek"
    >
      {state.textSize === "stor" ? "A−" : "A+"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Utloggad: marknadsupplevelse riktad till föräldrar                  */
/* ------------------------------------------------------------------ */

const MARKETING_NAV = [
  { href: "/#sa-funkar-det", label: "Så funkar det" },
  { href: "/#kursplan", label: "Kursplan" },
  { href: "/priser", label: "Priser" },
  { href: "/#fragor", label: "Vanliga frågor" },
];

function MarketingShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isHome = usePathname() === "/";
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Huvudmeny">
            {MARKETING_NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-sm font-medium text-navy hover:text-wine">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/logga-in" className="hidden text-sm font-semibold text-navy hover:text-wine sm:inline">
              Logga in
            </Link>
            <Link href="/logga-in?skapa=1" className="btn-accent whitespace-nowrap !px-4 !py-2 text-sm">
              Prova gratis
            </Link>
            <button className="rounded-lg border border-line px-2.5 py-1 text-navy md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Meny" aria-expanded={open}>
              ☰
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-line px-4 py-2 md:hidden">
            {[...MARKETING_NAV, { href: "/logga-in", label: "Logga in" }].map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-navy hover:bg-gold-light">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">{isHome ? children : <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>}</main>
      <footer className="bg-navy text-sm text-white/80">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-bold text-white">
              Matte<span className="text-gold">portalen</span>
            </p>
            <p className="mt-2">Läxhjälp i matematik för årskurs 4–6, skapad av behöriga lärare.</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-white">Tjänsten</p>
            {MARKETING_NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-gold">
                {n.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-white">Kontakt</p>
            <span>hej@matteportalen.se (platshållare)</span>
            <span>Följer Skolverkets kursplan för matematik</span>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} Matteportalen (arbetsnamn)</div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inloggad: app med sidomeny (dator) och bottenmeny (mobil)           */
/* ------------------------------------------------------------------ */

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = useIsActive();
  const { state, logout, currentStudent, tier } = useStore();
  const role = state.session!.role;
  const inLesson = pathname.startsWith("/steg/");
  const [collapsed, setCollapsed] = useState(inLesson);
  const [moreOpen, setMoreOpen] = useState(false);

  // Fäll ihop menyn automatiskt i lektionsflödet så att eleven kan fokusera.
  useEffect(() => setCollapsed(inLesson), [inLesson]);
  useEffect(() => setMoreOpen(false), [pathname]);

  const groups = NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter((g) => g.items.length);
  const flat = groups.flatMap((g) => g.items);
  const mobileItems = flat.filter((i) => i.mobile);
  const moreItems = flat.filter((i) => !i.mobile);

  const name = role === "elev" ? currentStudent?.name : role === "foralder" ? state.parent.name : "Lärare";
  const doLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidomeny, dator */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-paper transition-[width] duration-200 lg:flex ${collapsed ? "w-[72px]" : "w-64"}`}
        aria-label="Huvudmeny"
      >
        <div className={`flex items-center py-4 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          <Logo compact={collapsed} />
        </div>
        <nav className="flex-1 overflow-y-auto px-3">
          {groups.map((g) => (
            <div key={g.title} className="mb-4">
              {!collapsed && <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted">{g.title}</p>}
              <ul className="space-y-0.5">
                {g.items.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      title={collapsed ? n.label : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[0.95rem] font-medium transition-colors ${collapsed ? "justify-center" : ""} ${
                        isActive(n.href) ? "bg-navy text-white" : "text-navy hover:bg-gold-light"
                      }`}
                    >
                      <span aria-hidden className="text-lg">
                        {n.icon}
                      </span>
                      {!collapsed && n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-cream ${collapsed ? "justify-center" : ""}`}
            aria-label={collapsed ? "Fäll ut menyn" : "Fäll ihop menyn"}
          >
            <span aria-hidden>{collapsed ? "»" : "«"}</span>
            {!collapsed && "Fäll ihop menyn"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Tunn toppbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-cream/90 px-4 py-2.5 backdrop-blur lg:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden text-sm text-muted lg:block">
            {role === "elev" && currentStudent ? `Årskurs ${currentStudent.grade}` : role === "foralder" ? "Föräldravy" : "Lärarvy"}
          </div>
          <div className="flex items-center gap-2">
            <TextSizeButton />
            <div className="hidden text-right text-sm leading-tight sm:block">
              <span className="block font-semibold text-navy">{name}</span>
              <span className="text-xs text-muted">
                {ROLE_LABEL[role]} · {TIERS[tier].name}
              </span>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-wine font-semibold text-white" aria-hidden>
              {name?.[0] ?? "?"}
            </span>
            <button onClick={doLogout} className="hidden rounded-lg px-2 py-1 text-sm text-muted hover:text-wine sm:block">
              Logga ut
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-12">{children}</main>
      </div>

      {/* Bottenmeny, mobil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper lg:hidden" aria-label="Huvudmeny">
        {moreOpen && (
          <div className="border-b border-line p-2">
            {moreItems.map((n) => (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${isActive(n.href) ? "bg-navy text-white" : "text-navy"}`}>
                <span aria-hidden>{n.icon}</span>
                {n.label}
              </Link>
            ))}
            <button onClick={doLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-wine">
              <span aria-hidden>↩</span> Logga ut
            </button>
          </div>
        )}
        <ul className="grid grid-cols-5">
          {mobileItems.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className={`flex flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium ${isActive(n.href) ? "text-wine" : "text-navy"}`}>
                <span aria-hidden className="text-xl">
                  {n.icon}
                </span>
                {n.label.split(" ")[0].replace("Matematikövningar", "Övningar")}
              </Link>
            </li>
          ))}
          <li>
            <button onClick={() => setMoreOpen((o) => !o)} className={`flex w-full flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium ${moreOpen ? "text-wine" : "text-navy"}`} aria-expanded={moreOpen}>
              <span aria-hidden className="text-xl">
                ☰
              </span>
              Mer
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { state, ready } = useStore();
  if (!ready) return <div className="min-h-screen" />;
  return (
    <>
      {state.session ? <AppLayout>{children}</AppLayout> : <MarketingShell>{children}</MarketingShell>}
      <DemoBar />
    </>
  );
}
