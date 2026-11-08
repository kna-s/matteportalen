"use client";

import Link from "next/link";
import { useState } from "react";
import { BADGES } from "@/lib/badges";
import { chaptersFor, getChapter } from "@/lib/curriculum";
import { Student, StudentProgress, useStore } from "@/lib/store";
import { canAccess } from "@/lib/tiers";
import Icon from "./icons/Icon";
import { MascotSays } from "./Mascot";

const DAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // måndag = 0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

/** Barnanpassad resultatsida: veckan, märken och senaste quizen. */
export default function StudentResults({ student, p }: { student: Student; p: StudentProgress }) {
  const { tier } = useStore();
  const [hover, setHover] = useState<number | null>(null);
  const monday = startOfWeek();
  const todayIdx = (new Date().getDay() + 6) % 7;
  const perDay = DAYS.map((_, i) => {
    const from = new Date(monday);
    from.setDate(monday.getDate() + i);
    const to = new Date(from);
    to.setDate(from.getDate() + 1);
    return Object.values(p.completed).filter((d) => {
      const t = new Date(d).getTime();
      return t >= from.getTime() && t < to.getTime();
    }).length;
  });
  const weekSteps = perDay.reduce((a, b) => a + b, 0);
  const weekQuiz = p.quizResults.filter((r) => new Date(r.date) >= monday).length;
  const max = Math.max(4, ...perDay);

  const chapters = chaptersFor(student.grade);
  const chaptersDone = chapters.filter((c) => c.steps.filter((s) => canAccess(tier, s, c.id)).every((s) => p.completed[s.id])).length;
  const ctx = { p, grade: student.grade, tier };
  const badges = BADGES.filter((b) => b.earned(ctx)).length;
  const best = p.quizResults.reduce<{ score: number; total: number } | null>((b, r) => (!b || r.score / r.total > b.score / b.total ? r : b), null);
  const recent = [...p.quizResults].reverse().slice(0, 4);

  const message =
    weekSteps === 0
      ? "Den här veckan har du inte räknat än. Ett litet steg idag räcker!"
      : `Den här veckan har du klarat ${weekSteps} steg${weekQuiz ? ` och ${weekQuiz} quiz` : ""}. Grymt jobbat!`;

  return (
    <div className="space-y-6">
      <MascotSays mood={weekSteps > 0 ? "hurra" : "glad"} size={64}>
        {message}
      </MascotSays>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: "stjarna" as const, value: `${chaptersDone}`, sub: `av ${chapters.length}`, label: "kapitel klara", href: `/arskurs/${student.grade}` },
          { icon: "marken" as const, value: `${badges}`, sub: `av ${BADGES.length}`, label: "märken", href: "/marken" },
          { icon: "quiz" as const, value: best ? `${best.score}/${best.total}` : "–", sub: "", label: "bästa quiz", href: "/quiz" },
        ].map((k) => (
          <Link key={k.label} href={k.href} className="flex items-center gap-4 rounded-3xl bg-paper p-5 ring-1 ring-line transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-light">
              <Icon name={k.icon} size={34} />
            </span>
            <span>
              <span className="font-serif text-3xl font-bold text-navy">{k.value}</span>
              {k.sub && <span className="ml-1 text-sm text-muted">{k.sub}</span>}
              <span className="block text-sm text-muted">{k.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Icon name="kalender" size={26} /> Min vecka
        </h2>
        <p className="text-sm text-muted">Antal steg du har gjort varje dag.</p>
        <div className="mt-5 grid h-44 grid-cols-7 items-end gap-2 sm:gap-4">
          {perDay.map((n, i) => (
            <div key={DAYS[i]} className="relative flex h-full flex-col items-center justify-end gap-1.5" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {hover === i && (
                <span className="absolute -top-1 z-10 rounded-lg bg-ink px-2 py-1 text-xs font-semibold whitespace-nowrap text-white">
                  {n} steg
                </span>
              )}
              <span className="text-xs font-bold text-navy">{n > 0 ? n : ""}</span>
              <div
                className={`w-full max-w-12 rounded-t-lg transition-all ${n > 0 ? (i === todayIdx ? "bg-wine" : "bg-gold") : "bg-line"}`}
                style={{ height: n > 0 ? `${Math.max(10, (n / max) * 100)}%` : "6px" }}
              />
              <span className={`text-xs ${i === todayIdx ? "font-bold text-wine" : "text-muted"}`}>{i === todayIdx ? "Idag" : DAYS[i]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Icon name="quiz" size={26} /> Mina senaste quiz
        </h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-muted">Du har inte gjort någon quiz än. När du gör en dyker den upp här!</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {recent.map((r, i) => (
              <li key={`${r.stepId}-${i}`} className="rounded-2xl bg-cream p-4">
                <p className="font-semibold leading-tight text-navy">{getChapter(r.chapterId)?.title}</p>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: r.total }, (_, k) => (
                    <span key={k} className={`h-3 flex-1 rounded-full ${k < r.score ? "bg-good" : "bg-line"}`} />
                  ))}
                  <span className="ml-2 text-sm font-bold text-navy">
                    {r.score}/{r.total}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{new Date(r.date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
