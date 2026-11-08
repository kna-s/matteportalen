"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useState } from "react";
import { AREAS, GRADES, Grade, chaptersFor, getArea, getChapter } from "@/lib/curriculum";
import { trainingPlan } from "@/lib/screening";
import { Student, emptyProgress, useStore } from "@/lib/store";
import { tierAtLeast } from "@/lib/tiers";
import { DEFAULT_OUTFIT } from "@/lib/treasure";
import Mascot from "@/components/Mascot";
import { PageHeader, RequireLogin } from "@/components/ui";

export default function ParentPortal() {
  return (
    <div>
      <PageHeader icon="foraldraportal" title="Föräldraportal" />
      <RequireLogin roles={["foralder"]}>
        <Portal />
      </RequireLogin>
    </div>
  );
}

function Portal() {
  const { state, update, addStudent } = useStore();
  const [selected, setSelected] = useState(state.session?.studentId ?? state.students[0]?.id);
  const [adding, setAdding] = useState(state.students.length === 0);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>(4);
  const child = state.students.find((s) => s.id === selected) ?? state.students[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Barnen */}
      <aside className="space-y-2">
        {state.students.map((s) => {
          const active = child?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelected(s.id);
                setAdding(false);
                update((st) => ({ ...st, session: { ...st.session!, studentId: s.id } }));
              }}
              className={`flex w-full items-center gap-3 rounded-2xl p-2 pr-4 text-left transition-colors ${active && !adding ? "bg-navy text-white" : "bg-paper ring-1 ring-line hover:bg-cream"}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#d7f0f2]">
                <Mascot mood="glad" size={52} animate={false} outfit={state.outfits?.[s.id] ?? DEFAULT_OUTFIT} />
              </span>
              <span>
                <span className={`block font-bold ${active && !adding ? "text-white" : "text-navy"}`}>{s.name}</span>
                <span className={`text-sm ${active && !adding ? "text-white/70" : "text-muted"}`}>Årskurs {s.grade}</span>
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setAdding(true)}
          className={`flex w-full items-center gap-3 rounded-2xl border-2 border-dashed p-3 text-left font-semibold ${adding ? "border-navy text-navy" : "border-line text-muted hover:border-navy hover:text-navy"}`}
        >
          <Icon name="plus" size={24} /> Lägg till barn
        </button>
      </aside>

      {/* Innehåll */}
      <div className="min-w-0">
        {adding || !child ? (
          <form
            className="rounded-3xl bg-paper p-6 ring-1 ring-line"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              const s = addStudent(name, grade);
              setName("");
              setAdding(false);
              setSelected(s.id);
            }}
          >
            <h2 className="text-xl font-bold">Lägg till ett barn</h2>
            <p className="mt-1 text-sm text-muted">Barnet får ett eget användarnamn. Ingen e-post behövs.</p>
            <label className="mt-4 block text-sm">
              <span className="font-semibold text-navy">Förnamn</span>
              <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="T.ex. Leo" autoFocus />
            </label>
            <p className="mt-4 text-sm font-semibold text-navy">Årskurs</p>
            <div className="mt-1 grid max-w-xs grid-cols-3 gap-2">
              {GRADES.map((g) => (
                <button type="button" key={g} onClick={() => setGrade(g)} className={`rounded-xl py-3 font-serif text-2xl font-bold ${grade === g ? "bg-navy text-white" : "bg-cream text-navy"}`}>
                  {g}
                </button>
              ))}
            </div>
            <button className="btn-accent mt-5" disabled={!name.trim()}>
              Skapa elevkonto
            </button>
          </form>
        ) : (
          <ChildPanel key={child.id} child={child} />
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, children, aside }: { icon: Parameters<typeof Icon>[0]["name"]; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Icon name={icon} size={24} /> {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ChildPanel({ child }: { child: Student }) {
  const { state, update, tier } = useStore();
  const [areaId, setAreaId] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const selected = state.aktuellt[child.id] ?? [];
  const p = state.progress[child.id] ?? emptyProgress();
  const plan = trainingPlan(p, child.grade);
  const weekAgo = Date.now() - 7 * 864e5;
  const weekSteps = Object.values(p.completed).filter((d) => new Date(d).getTime() > weekAgo).length;
  const weekQuiz = p.quizResults.filter((r) => new Date(r.date).getTime() > weekAgo);

  const toggle = (id: string) =>
    update((s) => {
      const cur = s.aktuellt[child.id] ?? [];
      return { ...s, aktuellt: { ...s.aktuellt, [child.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } };
    });

  return (
    <div className="space-y-5">
      {/* Aktuellt */}
      <Section icon="aktuellt" title={`Aktuellt för ${child.name}`}>
        <p className="text-sm text-muted">Välj det {child.name} jobbar med i skolan just nu. Det visas överst för {child.name} och i förslagen.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.length === 0 && <span className="text-sm italic text-muted">Inget valt än.</span>}
          {selected.map((id) => {
            const ch = getChapter(id);
            return (
              <span key={id} className="inline-flex items-center gap-2 rounded-full bg-wine/10 py-1.5 pl-3 pr-2 text-sm font-semibold text-navy">
                {ch && <Icon name={getArea(ch.areaId).icon} size={18} />}
                {ch?.title}
                <button onClick={() => toggle(id)} className="grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-paper hover:text-bad" aria-label={`Ta bort ${ch?.title}`}>
                  ✕
                </button>
              </span>
            );
          })}
        </div>
        <p className="mt-4 text-sm font-semibold text-navy">Lägg till från ett område</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAreaId(areaId === a.id ? null : a.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-2 ${areaId === a.id ? "ring-navy" : "ring-transparent"}`}
              style={{ background: `${a.color}17` }}
            >
              <Icon name={a.icon} size={20} /> <span className="hidden sm:inline">{a.title.split(" ")[0]}</span>
            </button>
          ))}
        </div>
        {areaId && (
          <div className="pop-in mt-3 flex flex-wrap gap-2 rounded-2xl bg-cream p-3">
            {chaptersFor(child.grade, areaId).map((c) => {
              const on = selected.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggle(c.id)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${on ? "bg-navy text-white" : "bg-paper text-navy ring-1 ring-line hover:bg-gold-light"}`}>
                  {on ? "✓ " : "+ "}
                  {c.title}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Veckorapport */}
        <Section
          icon="brev"
          title="Veckorapport"
          aside={
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <span className="hidden sm:inline">Skicka på söndagar</span>
              <span className={`relative h-6 w-11 rounded-full transition-colors ${state.parent.weeklyReport ? "bg-good" : "bg-line"}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={state.parent.weeklyReport}
                  onChange={(e) => update((s) => ({ ...s, parent: { ...s.parent, weeklyReport: e.target.checked } }))}
                />
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${state.parent.weeklyReport ? "left-[22px]" : "left-0.5"}`} />
              </span>
            </label>
          }
        >
          <div className="rounded-2xl bg-cream p-4 text-sm">
            <p className="text-xs text-muted">Till: {state.parent.email}</p>
            <p className="mt-2">
              Den här veckan har <b>{child.name}</b> gjort <b>{weekSteps} steg</b>
              {tierAtLeast(tier, "plus") && weekQuiz.length > 0 && (
                <>
                  {" "}
                  och <b>{weekQuiz.length} quiz</b> med i snitt {Math.round((weekQuiz.reduce((s, r) => s + r.score / r.total, 0) / weekQuiz.length) * 100)} % rätt
                </>
              )}
              .
            </p>
            {tierAtLeast(tier, "premium") && plan.length > 0 && (
              <p className="mt-1">
                Bra att öva på: <b>{plan.slice(0, 2).map((x) => x.title).join(" och ")}</b>.
              </p>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">E-postutskick kopplas på i en senare fas.</p>
        </Section>

        {/* Inloggning */}
        <Section icon="las" title="Inloggning för barnet">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-cream px-4 py-3">
              <p className="text-xs text-muted">Användarnamn</p>
              <p className="font-mono font-bold text-navy">{child.username}</p>
            </div>
            <div className="rounded-2xl bg-cream px-4 py-3">
              <p className="text-xs text-muted">Lösenord</p>
              <p className="font-mono font-bold text-navy">{showPw ? `sigge-${child.username.length * 7}` : "••••••••"}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setShowPw((x) => !x)} className="btn-ghost !px-3 !py-1.5 text-sm">
              {showPw ? "Dölj" : "Visa"} lösenord
            </button>
            <button onClick={() => window.print()} className="btn-ghost !px-3 !py-1.5 text-sm">
              Skriv ut
            </button>
          </div>
        </Section>
      </div>

      {/* Inställningar */}
      <Section icon="admin" title="Inställningar">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-navy">Årskurs</span>
            <select
              className="rounded-lg border border-line bg-paper px-2 py-1 font-semibold"
              value={child.grade}
              onChange={(e) => update((s) => ({ ...s, students: s.students.map((x) => (x.id === child.id ? { ...x, grade: Number(e.target.value) as Grade } : x)) }))}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-3 text-sm">
            <Link href="/resultat" className="font-semibold text-navy underline">
              Se resultat
            </Link>
            <button
              className="font-semibold text-bad"
              onClick={() => {
                if (confirm(`Ta bort ${child.name}s konto? Allt ${child.name} har gjort försvinner.`))
                  update((s) => {
                    const students = s.students.filter((x) => x.id !== child.id);
                    return { ...s, students, session: s.session ? { ...s.session, studentId: students[0]?.id } : s.session };
                  });
              }}
            >
              Ta bort konto
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
