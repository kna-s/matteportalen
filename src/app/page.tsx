"use client";

import { welcomeBack } from "@/lib/encourage";
import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { STEP_ICON, STEP_LABELS, getChapter } from "@/lib/curriculum";
import { continuePoint, stepHref } from "@/lib/flow";
import { emptyProgress, useStore } from "@/lib/store";
import Landing from "@/components/LandingNew";
import ParentHome from "@/components/ParentHome";
import { TreasureTrailStrip } from "@/components/Treasure";
import AdminPanel from "@/components/AdminPanel";
import { MascotSays, Mood } from "@/components/Mascot";
import { useEffect, useState } from "react";
import { LINE_LABEL, SiggeLine, shuffledLines } from "@/lib/funfacts";
import { BadgeMedal } from "@/components/Badges";
import { BADGES } from "@/lib/badges";

export default function Home() {
  const { state, ready } = useStore();
  if (!ready) return null;
  if (!state.session) return <Landing />;
  if (state.session.role === "admin") return <AdminPanel />;
  return state.session.role === "elev" ? <StudentHome /> : <ParentHome />;
}

/* ------------------------------------------------------------------ */
/* Elevens startsida: bara det som leder framåt                        */
/* ------------------------------------------------------------------ */

function StudentHome() {
  const { state, currentStudent, tier } = useStore();
  if (!currentStudent) return null;
  const p = state.progress[currentStudent.id] ?? emptyProgress();
  const cont = continuePoint(currentStudent.grade, tier, p);
  const aktuellt = (state.aktuellt[currentStudent.id] ?? []).map(getChapter).filter((c) => !!c);
  const ctx = { p, grade: currentStudent.grade, tier };
  const earned = BADGES.filter((b) => b.earned(ctx));
  const next = BADGES.filter((b) => !b.earned(ctx))
    .map((b) => ({ badge: b, prog: b.progress?.(ctx) ?? 0 }))
    .sort((a, b) => b.prog - a.prog)[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Hej {currentStudent.name}!</h1>
        <div className="mt-2">
          <SiggeTalk
            greeting={
              welcomeBack(p) ??
              (cont ? `Kul att se dig! Idag fortsätter vi med ${cont.chapter.title.toLowerCase()}. Ett steg i taget.` : "Wow, du har gjort allt! Nytt material kommer snart.")
            }
          />
        </div>
      </div>

      {/* Ett stort kort: nästa steg och stigen till kistan */}
      <section className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-line">
        <div className="bg-navy text-white">
          {cont ? (
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wider text-gold">Ditt nästa steg</p>
                <h2 className="icon-invert mt-2 flex items-center gap-3 text-2xl font-bold !text-white sm:text-3xl">
                  <Icon name={STEP_ICON[cont.step.type]} size={40} /> {STEP_LABELS[cont.step.type]}
                </h2>
                <p className="mt-1 text-white/75">{cont.chapter.title}</p>
              </div>
              <Link href={stepHref(cont.step.id)} className="btn shrink-0 bg-gold !py-4 text-xl text-navy hover:bg-gold-light sm:!px-10">
                Fortsätt →
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Icon name="firande" size={56} className="icon-invert mx-auto" />
              <p className="mt-2 text-xl font-bold">Du har gjort allt som finns just nu!</p>
              <p className="text-white/70">Snyggt jobbat. Nytt material kommer varje månad.</p>
            </div>
          )}
        </div>
        <TreasureTrailStrip />
      </section>

      {/* Två små rutor */}
      <div className={`grid grid-cols-1 gap-3 ${aktuellt.length > 0 && next ? "sm:grid-cols-2" : ""}`}>
        {aktuellt.length > 0 && (
          <Link
            href={stepHref(aktuellt[0].steps[0].id)}
            className="group flex min-w-0 items-center gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line transition-shadow hover:shadow-md"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-wine/10">
              <Icon name="aktuellt" size={28} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-wine">Tips från din förälder</span>
              <span className="block truncate font-bold text-navy">{aktuellt.map((c) => c.title).join(", ")}</span>
            </span>
            <span className="text-navy transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        )}
        {next && (
          <Link href="/marken" className="group flex min-w-0 items-center gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line transition-shadow hover:shadow-md">
            <BadgeMedal badge={next.badge} earned={false} size={48} progress={next.prog} />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
                Nästa märke · {earned.length} av {BADGES.length} klara
              </span>
              <span className="block font-bold text-navy">{next.badge.name}</span>
              <span className="block truncate text-sm text-muted">{next.badge.hint}</span>
            </span>
            <span className="text-navy transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}

const LINE_MOOD: Record<SiggeLine["kind"], Mood> = { fakta: "tanker", tips: "pekar", pepp: "hurra" };

/** Sigge hälsar först och byter sen till roliga fakta, tips och pepp medan eleven är kvar. */
function SiggeTalk({ greeting }: { greeting: string }) {
  const [lines] = useState(shuffledLines);
  const [idx, setIdx] = useState(-1);
  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % lines.length), idx === -1 ? 9000 : 14000);
    return () => clearTimeout(t);
  }, [idx, lines.length]);
  const line = idx >= 0 ? lines[idx] : null;
  return (
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <MascotSays mood={line ? LINE_MOOD[line.kind] : "glad"}>
          <span key={idx} className="bubble-in block" aria-live="polite">
            {line ? (
              <>
                <b className="text-wine">{LINE_LABEL[line.kind]}</b> {line.text}
              </>
            ) : (
              greeting
            )}
          </span>
        </MascotSays>
      </div>
      <button
        onClick={() => setIdx((i) => (i + 1) % lines.length)}
        className="mb-3 shrink-0 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-navy shadow-sm ring-1 ring-line hover:bg-gold-light"
        title="Sigge berättar något nytt"
      >
        Berätta mer
      </button>
    </div>
  );
}
