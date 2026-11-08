"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useState } from "react";
import { GRADES, Grade, chaptersFor, getChapter } from "@/lib/curriculum";
import { trainingPlan } from "@/lib/screening";
import { emptyProgress, useStore } from "@/lib/store";
import { TIERS, tierAtLeast } from "@/lib/tiers";
import AktuelltPicker from "@/components/AktuelltPicker";
import { PageHeader, ProgressBar, RequireLogin } from "@/components/ui";

export default function ParentPortal() {
  return (
    <div>
      <PageHeader
        icon="foraldraportal"
        title="Föräldraportal"
        intro="Skapa konton åt dina barn, välj vad som är aktuellt för dem, följ hur det går och få en veckorapport."
      />
      <RequireLogin roles={["foralder"]}>
        <Content />
      </RequireLogin>
    </div>
  );
}

function Content() {
  const { state, update, tier } = useStore();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>(4);
  const [adding, setAdding] = useState(false);

  const weekAgo = Date.now() - 7 * 864e5;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>
          Inloggad som <b>{state.parent.name}</b> · Abonnemang: <b>{TIERS[tier].name}</b>{" "}
          <Link href="/abonnemang" className="text-wine underline">
            ändra
          </Link>
        </p>
        <button className="btn-primary" onClick={() => setAdding((a) => !a)}>
          + Lägg till barn
        </button>
      </div>

      {adding && (
        <form
          className="card grid gap-3 sm:grid-cols-[1fr_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const id = `${name.trim().toLowerCase().replace(/[^a-zåäö0-9]/g, "")}-${Date.now().toString(36)}`;
            update((s) => ({
              ...s,
              students: [...s.students, { id, name: name.trim(), grade, username: `${name.trim().toLowerCase()}.${s.students.length + 1}` }],
              progress: { ...s.progress, [id]: emptyProgress() },
            }));
            setName("");
            setAdding(false);
          }}
        >
          <input className="input" placeholder="Barnets förnamn" value={name} onChange={(e) => setName(e.target.value)} aria-label="Barnets förnamn" />
          <select className="input" value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)} aria-label="Årskurs">
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Åk {g}
              </option>
            ))}
          </select>
          <button className="btn-accent">Skapa elevkonto</button>
          <p className="text-xs text-muted sm:col-span-3">
            Barnet loggar in med ett användarnamn och lösenord som du väljer. Ingen e-post behövs för barnet. (Lösenord sätts i nästa fas.)
          </p>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {state.students.map((st) => {
          const p = state.progress[st.id] ?? emptyProgress();
          const chs = chaptersFor(st.grade);
          const total = chs.reduce((s, c) => s + c.steps.length, 0);
          const done = chs.reduce((s, c) => s + c.steps.filter((x) => p.completed[x.id]).length, 0);
          const weekSteps = Object.values(p.completed).filter((d) => new Date(d).getTime() > weekAgo).length;
          const weekQuiz = p.quizResults.filter((r) => new Date(r.date).getTime() > weekAgo);
          const last = Object.values(p.completed).sort().at(-1);
          const plan = trainingPlan(p, st.grade);
          return (
            <div key={st.id} className="card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{st.name}</h2>
                  <p className="text-sm text-muted">
                    Åk {st.grade} · användarnamn: {st.username}
                  </p>
                </div>
                <button
                  className="text-sm text-muted hover:text-bad"
                  onClick={() => {
                    if (confirm(`Ta bort ${st.name}s konto?`))
                      update((s) => ({ ...s, students: s.students.filter((x) => x.id !== st.id), session: s.session?.studentId === st.id ? { ...s.session, studentId: s.students.find((x) => x.id !== st.id)?.id } : s.session }));
                  }}
                >
                  Ta bort
                </button>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Framgång i åk {st.grade}</span>
                  <b>{Math.round((done / total) * 100)} %</b>
                </div>
                <ProgressBar value={done / total} />
              </div>
              <p className="text-sm">
                Senast aktiv: <b>{last ? new Date(last).toLocaleDateString("sv-SE") : "aldrig"}</b>
              </p>

              <AktuelltPicker student={st} />

              <div className="rounded-xl bg-cream p-3 text-sm">
                <p className="flex items-center gap-2 font-semibold text-navy"><Icon name="brev" size={20} /> Veckorapport</p>
                <p>
                  Den här veckan har {st.name} gjort <b>{weekSteps}</b> steg
                  {tierAtLeast(tier, "plus") && (
                    <>
                      {" "}
                      och <b>{weekQuiz.length}</b> quiz
                      {weekQuiz.length > 0 && <> med i snitt {Math.round((weekQuiz.reduce((s, r) => s + r.score / r.total, 0) / weekQuiz.length) * 100)} % rätt</>}
                    </>
                  )}
                  .
                </p>
                {tierAtLeast(tier, "premium") && plan.length > 0 && (
                  <p className="mt-1">
                    Behöver öva på: <b>{plan.map((x) => getChapter(x.chapterId)?.title).join(", ")}</b>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/resultat" onClick={() => update((s) => ({ ...s, session: { ...s.session!, studentId: st.id } }))} className="btn-ghost !py-1.5 text-sm">
                  Se resultat
                </Link>
                {tierAtLeast(tier, "plus") && (
                  <Link href="/screening" onClick={() => update((s) => ({ ...s, session: { ...s.session!, studentId: st.id } }))} className="btn-ghost !py-1.5 text-sm">
                    Se screening
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <label className="card flex items-center gap-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-navy"
          checked={state.parent.weeklyReport}
          onChange={(e) => update((s) => ({ ...s, parent: { ...s.parent, weeklyReport: e.target.checked } }))}
        />
        <span>
          Skicka veckorapport till <b>{state.parent.email}</b> varje söndag
          <span className="block text-xs text-muted">E-postutskick kopplas på i en senare fas.</span>
        </span>
      </label>
    </div>
  );
}
