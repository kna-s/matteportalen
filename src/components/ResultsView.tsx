"use client";

import { useState } from "react";
import { chaptersFor, getChapter } from "@/lib/curriculum";
import { Student, StudentProgress } from "@/lib/store";
import { ProgressBar } from "./ui";

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
  const history = [
    ...Object.entries(p.completed).map(([stepId, date]) => ({ stepId, date })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Klart i åk " + student.grade, value: `${Math.round((done / total) * 100)} %` },
          { label: "Videor sedda", value: `${videos} / ${chapters.length}` },
          { label: "Övningar gjorda", value: `${exercises} / ${chapters.length}` },
          { label: "Snitt på quiz", value: avg === null ? "–" : `${Math.round(avg * 100)} %` },
        ].map((k) => (
          <div key={k.label} className="card">
            <p className="text-sm text-muted">{k.label}</p>
            <p className="font-serif text-3xl font-bold text-navy">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <p className="mb-1 font-semibold text-navy">Total framgång</p>
        <ProgressBar value={done / total} />
      </div>

      <section className="card">
        <h2 className="text-xl font-bold">Quizresultat över tid</h2>
        <p className="mb-3 text-sm text-muted">Andel rätt på de senaste quizen. Håll musen över en stapel för att se mer.</p>
        <QuizChart p={p} />
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">Historik</h2>
        {history.length === 0 ? (
          <p className="text-muted">Ingen aktivitet ännu.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-1 font-medium">Datum</th>
                <th className="py-1 font-medium">Kapitel</th>
                <th className="py-1 font-medium">Steg</th>
                <th className="py-1 text-right font-medium">Resultat</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => {
                const ch = chapters.find((c) => c.steps.some((s) => s.id === h.stepId));
                const st = ch?.steps.find((s) => s.id === h.stepId);
                const q = p.quizResults.filter((r) => r.stepId === h.stepId).at(-1);
                return (
                  <tr key={h.stepId} className="border-t border-line">
                    <td className="py-1.5">{fmtDate(h.date)}</td>
                    <td className="py-1.5">{ch?.title ?? "–"}</td>
                    <td className="py-1.5 capitalize">{st?.type === "ovning" ? "övning" : st?.type}</td>
                    <td className="py-1.5 text-right">{q ? `${q.score}/${q.total}` : "✓"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
