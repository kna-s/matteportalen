"use client";

import { useState } from "react";
import { AREAS, STEP_ICON, STEP_LABELS, chaptersFor, getChapter } from "@/lib/curriculum";
import { Student, StudentProgress } from "@/lib/store";
import Icon, { IconName } from "./icons/Icon";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

/** Stapeldiagram över quizresultat i tidsordning (en serie, hover visar detaljer). */
function QuizChart({ p }: { p: StudentProgress }) {
  const [hover, setHover] = useState<number | null>(null);
  const data = [...p.quizResults].sort((a, b) => a.date.localeCompare(b.date)).slice(-12);
  if (!data.length) return <p className="text-muted">Inga quiz gjorda ännu.</p>;
  const h = 160;
  const bw = 26;
  const gap = 10;
  const w = data.length * (bw + gap) + 48;
  return (
    <div className="relative overflow-x-auto">
      <svg width={w} height={h + 30} role="img" aria-label="Quizresultat över tid i procent">
        {[0, 50, 100].map((t) => (
          <g key={t}>
            <line x1={42} x2={w} y1={h - (t / 100) * h + 4} y2={h - (t / 100) * h + 4} stroke="var(--color-line)" />
            <text x={36} y={h - (t / 100) * h + 8} fontSize={10} textAnchor="end" fill="var(--color-muted)">
              {t}%
            </text>
          </g>
        ))}
        {data.map((r, i) => {
          const v = r.score / r.total;
          const bh = Math.max(4, v * h);
          const x = 48 + i * (bw + gap);
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={x - gap / 2} y={0} width={bw + gap} height={h + 30} fill="transparent" />
              <path
                d={`M${x} ${h + 4} V${h + 4 - bh + 4} a4 4 0 0 1 4 -4 h${bw - 8} a4 4 0 0 1 4 4 V${h + 4} Z`}
                fill={hover === i ? "var(--color-navy-light)" : "var(--color-navy)"}
              />
              <text x={x + bw / 2} y={h + 22} fontSize={9} textAnchor="middle" fill="var(--color-muted)">
                {fmtDate(r.date)}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 rounded-lg border border-line bg-paper px-3 py-2 text-sm shadow" style={{ left: Math.min(48 + hover * (bw + gap), w - 180) }}>
          <b className="text-navy">{getChapter(data[hover].chapterId)?.title}</b>
          <div className="text-muted">
            {data[hover].score}/{data[hover].total} rätt · {fmtDate(data[hover].date)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsView({ student, p }: { student: Student; p: StudentProgress }) {
  const chapters = chaptersFor(student.grade);
  const total = chapters.reduce((s, c) => s + c.steps.length, 0);
  const done = chapters.reduce((s, c) => s + c.steps.filter((x) => p.completed[x.id]).length, 0);
  const videos = chapters.filter((c) => p.completed[c.steps[0].id]).length;
  const exercises = chapters.filter((c) => p.completed[c.steps[1].id]).length;
  const avg = p.quizResults.length ? p.quizResults.reduce((s, r) => s + r.score / r.total, 0) / p.quizResults.length : null;
  const history = Object.entries(p.completed)
    .map(([stepId, date]) => ({ stepId, date }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);
  const byDay = history.reduce<Record<string, typeof history>>((acc, h) => {
    const k = h.date.slice(0, 10);
    (acc[k] ??= []).push(h);
    return acc;
  }, {});

  const tiles: { icon: IconName; value: string; label: string }[] = [
    { icon: "kursplan", value: `${Math.round((done / total) * 100)} %`, label: `klart i åk ${student.grade}` },
    { icon: "video", value: `${videos}/${chapters.length}`, label: "videor sedda" },
    { icon: "ovning", value: `${exercises}/${chapters.length}`, label: "övningar gjorda" },
    { icon: "quiz", value: avg === null ? "–" : `${Math.round(avg * 100)} %`, label: "snitt på quiz" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((k) => (
          <div key={k.label} className="flex items-center gap-3 rounded-3xl bg-paper p-4 ring-1 ring-line">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream">
              <Icon name={k.icon} size={28} />
            </span>
            <span>
              <span className="block font-serif text-2xl font-bold leading-tight text-navy">{k.value}</span>
              <span className="text-xs text-muted">{k.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
          <h2 className="text-lg font-bold">Quizresultat över tid</h2>
          <p className="mb-3 text-sm text-muted">Andel rätt på de senaste quizen.</p>
          <QuizChart p={p} />
        </section>

        <section className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
          <h2 className="mb-3 text-lg font-bold">Per område</h2>
          <ul className="space-y-3">
            {AREAS.map((a) => {
              const chs = chapters.filter((c) => c.areaId === a.id);
              const t = chs.reduce((s, c) => s + c.steps.length, 0);
              const d = chs.reduce((s, c) => s + c.steps.filter((x) => p.completed[x.id]).length, 0);
              return (
                <li key={a.id} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${a.color}1f` }}>
                    <Icon name={a.icon} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between text-sm">
                      <span className="truncate font-medium text-navy">{a.title}</span>
                      <span className="ml-2 shrink-0 text-muted">{Math.round((d / t) * 100)} %</span>
                    </span>
                    <span className="mt-1 block h-2 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full" style={{ width: `${(d / t) * 100}%`, background: a.color }} />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
        <h2 className="text-lg font-bold">Senaste aktivitet</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-muted">Ingen aktivitet ännu.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {Object.entries(byDay).map(([day, items]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                  {new Date(day).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <ul className="space-y-1.5 border-l-2 border-line pl-4">
                  {items.map((h) => {
                    const ch = chapters.find((c) => c.steps.some((s) => s.id === h.stepId));
                    const st = ch?.steps.find((s) => s.id === h.stepId);
                    const q = p.quizResults.filter((r) => r.stepId === h.stepId).at(-1);
                    return (
                      <li key={h.stepId} className="relative flex items-center gap-3 text-sm">
                        <span className="absolute -left-[23px] h-3 w-3 rounded-full border-2 border-paper bg-gold" />
                        {st && <Icon name={STEP_ICON[st.type]} size={20} />}
                        <span className="flex-1">
                          {st ? STEP_LABELS[st.type] : "Steg"} · <b className="text-navy">{ch?.title}</b>
                        </span>
                        {q ? (
                          <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${q.score / q.total >= 0.6 ? "bg-good/15 text-good" : "bg-gold-light text-gold-ink"}`}>
                            {q.score}/{q.total}
                          </span>
                        ) : (
                          <span className="text-good">✓</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
