"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/icons/Icon";
import { AREAS, GRADES, Grade, STEP_ICON, STEP_LABELS, chaptersFor } from "@/lib/curriculum";
import { continuePoint, stepHref } from "@/lib/flow";
import { emptyProgress, useStore } from "@/lib/store";
import { canAccess } from "@/lib/tiers";
import { PageHeader } from "@/components/ui";

function Ring({ ratio, color, size = 64 }: { ratio: number; color: string; size?: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="-rotate-90" aria-hidden>
      <circle cx={32} cy={32} r={r} fill="none" stroke="var(--color-line)" strokeWidth={6} />
      {ratio > 0 && <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${c * ratio} ${c}`} />}
    </svg>
  );
}

export default function GradePage() {
  const { grade: raw } = useParams<{ grade: string }>();
  const grade = Number(raw) as Grade;
  const { state, tier, currentStudent } = useStore();
  const p = (currentStudent && state.progress[currentStudent.id]) || emptyProgress();
  const valid = GRADES.includes(grade);
  const cont = valid ? continuePoint(grade, tier, p) : undefined;
  const [openArea, setOpenArea] = useState<string | null>(null);

  // Öppna området från länken (#geometri) eller där eleven är just nu.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    setOpenArea(AREAS.some((a) => a.id === hash) ? hash : (cont?.chapter.areaId ?? AREAS[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade]);

  if (!valid) return <p>Årskursen finns inte.</p>;

  const chapterDone = (id: string) => {
    const ch = chaptersFor(grade).find((c) => c.id === id)!;
    return ch.steps.filter((s) => canAccess(tier, s, ch.id)).every((s) => p.completed[s.id]);
  };

  return (
    <div>
      <Link href="/arskurs" className="text-sm text-muted hover:text-navy">
        ← Alla årskurser
      </Link>
      <PageHeader icon="arskurs" title={`Årskurs ${grade}`} intro="Välj ett område för att se kapitlen. Ringen visar hur mycket du har klarat." />

      <div className="grid gap-4 md:grid-cols-2">
        {AREAS.map((a) => {
          const chs = chaptersFor(grade, a.id);
          const done = chs.filter((c) => chapterDone(c.id)).length;
          const isOpen = openArea === a.id;
          const here = cont?.chapter.areaId === a.id;
          return (
            <section
              key={a.id}
              id={a.id}
              className={`scroll-mt-24 overflow-hidden rounded-3xl bg-paper transition-shadow ${isOpen ? "shadow-md md:col-span-2" : "ring-1 ring-line hover:shadow-md"}`}
              style={isOpen ? { boxShadow: `0 0 0 2px ${a.color}` } : undefined}
            >
              <button onClick={() => setOpenArea(isOpen ? null : a.id)} className="flex w-full items-center gap-4 p-5 text-left" aria-expanded={isOpen}>
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl" style={{ background: `${a.color}1f` }}>
                  <Icon name={a.icon} size={40} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold leading-tight text-navy">{a.title}</span>
                  <span className="text-sm text-muted">
                    {done} av {chs.length} kapitel klara
                  </span>
                  {here && <span className="chip ml-2 bg-gold-light text-gold-ink">Du är här</span>}
                </span>
                <span className="relative grid shrink-0 place-items-center">
                  <Ring ratio={done / chs.length} color={a.color} />
                  <span className="absolute text-xs font-bold text-navy">{Math.round((done / chs.length) * 100)}%</span>
                </span>
                <span className={`text-2xl leading-none text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden>
                  ⌄
                </span>
              </button>

              {isOpen && (
                <ol className="grid gap-2 border-t border-line p-4 sm:p-5 md:grid-cols-2">
                  {chs.map((c, i) => {
                    const isDone = chapterDone(c.id);
                    const isCurrent = cont?.chapter.id === c.id;
                    const target = c.steps.find((s) => canAccess(tier, s, c.id) && !p.completed[s.id]) ?? c.steps[0];
                    return (
                      <li key={c.id}>
                        <Link href={stepHref(target.id)} className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${isCurrent ? "bg-gold-light/60" : "hover:bg-cream"}`}>
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${
                              isDone ? "bg-good text-white" : isCurrent ? "bg-gold text-navy ring-4 ring-gold/30" : "border-2 border-line bg-paper text-muted"
                            }`}
                          >
                            {isDone ? "✓" : i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold leading-tight text-navy">{c.title}</span>
                            <span className="mt-1.5 flex gap-1.5">
                              {c.steps.map((s) => {
                                const open = canAccess(tier, s, c.id);
                                const sDone = !!p.completed[s.id];
                                return (
                                  <span
                                    key={s.id}
                                    title={`${STEP_LABELS[s.type]}${sDone ? " (klar)" : open ? "" : " (låst)"}`}
                                    className={`grid h-6 w-6 place-items-center rounded-md ${sDone ? "bg-good/15" : open ? "bg-cream" : "bg-cream opacity-40"}`}
                                  >
                                    <Icon name={open ? STEP_ICON[s.type] : "las"} size={16} />
                                  </span>
                                );
                              })}
                            </span>
                          </span>
                          {isCurrent && <span className="hidden shrink-0 text-sm font-semibold text-wine sm:inline">Fortsätt →</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
