"use client";

import { useState } from "react";
import { AREAS, GRADES, Grade, STEP_ICONS, TOOL_LABELS, chaptersFor } from "@/lib/curriculum";
import { emptyProgress, useStore } from "@/lib/store";
import { PageHeader, Placeholder, RequireLogin } from "@/components/ui";

export default function TeacherPage() {
  return (
    <div>
      <PageHeader icon="🧑‍🏫" title="Lärarvy" intro="För våra lärare: välj vad som är aktuellt för eleverna, se över innehållet och följ elevernas framsteg." />
      <RequireLogin roles={["admin"]}>
        <Content />
      </RequireLogin>
    </div>
  );
}

function Content() {
  const { state, update, reset } = useStore();
  const [grade, setGrade] = useState<Grade>(4);
  const aktuellt = state.aktuellt[grade] ?? [];

  const toggle = (id: string) =>
    update((s) => {
      const cur = s.aktuellt[grade] ?? [];
      return { ...s, aktuellt: { ...s.aktuellt, [grade]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } };
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {GRADES.map((g) => (
          <button key={g} onClick={() => setGrade(g)} className={grade === g ? "btn-primary !py-1.5" : "btn-ghost !py-1.5"}>
            Åk {g}
          </button>
        ))}
      </div>

      <section className="card">
        <h2 className="text-xl font-bold">📌 Aktuellt för åk {grade}</h2>
        <p className="text-sm text-muted">Bocka i de kapitel som ska visas som ”Aktuellt” på elevernas startsida.</p>
        <div className="mt-4 space-y-4">
          {AREAS.map((a) => (
            <div key={a.id}>
              <p className="mb-1 font-semibold text-navy">
                {a.emoji} {a.title}
              </p>
              <div className="flex flex-wrap gap-2">
                {chaptersFor(grade, a.id).map((c) => (
                  <label key={c.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${aktuellt.includes(c.id) ? "border-wine bg-wine/10" : "border-line"}`}>
                    <input type="checkbox" className="accent-wine" checked={aktuellt.includes(c.id)} onChange={() => toggle(c.id)} />
                    {c.title}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">📚 Innehåll för åk {grade}</h2>
        <p className="text-sm text-muted">Översikt över kapitel och steg. Uppladdning av videor, övningar och quiz byggs i nästa fas.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-1 font-medium">Kapitel</th>
                <th className="py-1 font-medium">Steg</th>
                <th className="py-1 font-medium">Hjälpmedel</th>
                <th className="py-1 font-medium">Publicerad</th>
              </tr>
            </thead>
            <tbody>
              {chaptersFor(grade).map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="py-1.5">{c.title}</td>
                  <td className="py-1.5">{c.steps.map((s) => STEP_ICONS[s.type]).join(" ")}</td>
                  <td className="py-1.5 text-muted">{c.steps[1].tools.map((t) => TOOL_LABELS[t]).join(", ") || "–"}</td>
                  <td className="py-1.5 text-muted">{c.steps[0].publishedMonth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Placeholder>Här kommer formulär för att ladda upp video, skriva övningar, skapa quizfrågor och välja hjälpmedel per uppgift.</Placeholder>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">👥 Elever</h2>
        <ul className="mt-3 divide-y divide-line">
          {state.students.map((s) => {
            const p = state.progress[s.id] ?? emptyProgress();
            return (
              <li key={s.id} className="flex justify-between py-2 text-sm">
                <span>
                  <b>{s.name}</b> · åk {s.grade}
                </span>
                <span className="text-muted">
                  {Object.keys(p.completed).length} steg · {p.quizResults.length} quiz
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <button className="btn-ghost text-sm" onClick={() => confirm("Återställ all demodata?") && reset()}>
        Återställ demodata
      </button>
    </div>
  );
}
