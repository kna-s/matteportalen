"use client";

import Icon, { IconName } from "@/components/icons/Icon";
import { useState } from "react";
import { AREAS, GRADES, Grade, STEP_ICON, STEP_LABELS, StepType, TOOL_LABELS, chaptersFor } from "@/lib/curriculum";
import { emptyProgress, useStore } from "@/lib/store";
import { TIERS } from "@/lib/tiers";
import { ContentWizard, MyMaterial } from "./ContentEditor";
import { ContentItem, useContent } from "@/lib/content";

const TABS = [
  { id: "nytt", label: "Lägg upp nytt", icon: "plus" },
  { id: "material", label: "Mitt material", icon: "ovning" },
  { id: "innehall", label: "Kursplanen", icon: "kursplan" },
  { id: "oversikt", label: "Översikt", icon: "hem" },
  { id: "kunder", label: "Kunder", icon: "foraldraportal" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function AdminPanel() {
  const [tab, setTab] = useState<TabId>("nytt");
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3"><Icon name="admin" size={40} /> Administration</h1>
      </div>
      <div className="flex flex-wrap gap-1 rounded-xl bg-paper p-1 shadow-sm sm:inline-flex" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setEditItem(null);
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === t.id ? "bg-navy text-white" : "text-navy hover:bg-cream"}`}
          >
            <Icon name={t.icon} size={18} className={tab === t.id ? "icon-invert" : ""} /> {t.label}
          </button>
        ))}
      </div>
      {tab === "oversikt" && <Overview goTo={setTab} />}
      {tab === "innehall" && <ContentList />}
      {tab === "nytt" && <ContentWizard key={editItem?.id ?? "ny"} editItem={editItem} onDone={() => editItem && (setEditItem(null), setTab("material"))} />}
      {tab === "material" && (
        <MyMaterial
          onEdit={(it) => {
            setEditItem(it);
            setTab("nytt");
          }}
        />
      )}
      {tab === "kunder" && <Customers />}
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: IconName; label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-paper p-4 ring-1 ring-line">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream">
        <Icon name={icon} size={28} />
      </span>
      <span>
        <span className="block font-serif text-2xl font-bold leading-tight text-navy">{value}</span>
        <span className="text-xs text-muted">
          {label}
          {sub && ` · ${sub}`}
        </span>
      </span>
    </div>
  );
}

const CHECKLIST = ["Spela in och ladda upp nya videolektioner", "Skriv övningar till de nya kapitlen", "Skapa nya quizfrågor", "Förhandsvisa allt som elev", "Publicera"];

function Overview({ goTo }: { goTo: (t: TabId) => void }) {
  const { state } = useStore();
  const { all } = useContent();
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthItems = all.filter((i) => i.published_month === thisMonth);
  const [checked, setChecked] = useState<string[]>([]);
  const count = (t: StepType) => all.filter((i) => i.type === t).length;
  const monthName = new Date().toLocaleDateString("sv-SE", { month: "long" });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="foraldraportal" label="Familjer" value={1} sub="demo" />
        <Stat icon="elev" label="Elever" value={state.students.length} />
        <Stat icon="video" label="Egna videor" value={count("video")} />
        <Stat icon="quiz" label="Egna quiz" value={count("quiz")} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Icon name="kalender" size={24} /> Månadens uppdatering
            </h2>
            <span className="text-sm text-muted">
              {checked.length}/{CHECKLIST.length} klart
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-good transition-all" style={{ width: `${(checked.length / CHECKLIST.length) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-1.5">
            {CHECKLIST.map((t) => {
              const on = checked.includes(t);
              return (
                <li key={t}>
                  <button
                    onClick={() => setChecked((c) => (on ? c.filter((x) => x !== t) : [...c, t]))}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${on ? "bg-good/10 text-muted line-through" : "hover:bg-cream"}`}
                  >
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 ${on ? "border-good bg-good text-white" : "border-line"}`}>{on ? "✓" : ""}</span>
                    {t}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Publicerat i {monthName}: <b className="text-navy">{monthItems.length}</b>
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <button onClick={() => goTo("nytt")} className="flex items-center gap-4 rounded-3xl bg-wine p-5 text-left text-white transition-transform hover:-translate-y-0.5">
            <Icon name="plus" size={40} className="icon-invert" />
            <span>
              <span className="block text-lg font-bold">Lägg upp nytt</span>
              <span className="text-sm text-white/80">Video, övning eller quiz</span>
            </span>
          </button>
          <button onClick={() => goTo("material")} className="flex items-center gap-4 rounded-3xl bg-paper p-5 text-left ring-1 ring-line transition-transform hover:-translate-y-0.5">
            <Icon name="ovning" size={36} />
            <span>
              <span className="block font-bold text-navy">Mitt material</span>
              <span className="text-sm text-muted">{all.length} uppladdade</span>
            </span>
          </button>
          <button onClick={() => goTo("innehall")} className="flex items-center gap-4 rounded-3xl bg-paper p-5 text-left ring-1 ring-line transition-transform hover:-translate-y-0.5">
            <Icon name="kursplan" size={36} />
            <span>
              <span className="block font-bold text-navy">Kursplanen</span>
              <span className="text-sm text-muted">Se vilka kapitel som har eget material</span>
            </span>
          </button>
        </section>
      </div>
    </div>
  );
}

function ContentList() {
  const [grade, setGrade] = useState<Grade>(4);
  const { rows } = useContent();
  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Innehåll för åk {grade}</h2>
        <div className="flex gap-1">
          {GRADES.map((g) => (
            <button key={g} onClick={() => setGrade(g)} className={grade === g ? "btn-primary !px-3 !py-1 text-sm" : "btn-ghost !px-3 !py-1 text-sm"}>
              Åk {g}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2 font-medium">Område</th>
              <th className="py-2 font-medium">Kapitel</th>
              <th className="py-2 font-medium">Steg</th>
              <th className="py-2 font-medium">Hjälpmedel</th>
              <th className="py-2 font-medium">Publicerad</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {chaptersFor(grade).map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="py-2"><Icon name={AREAS.find((a) => a.id === c.areaId)!.icon} size={22} /></td>
                <td className="py-2 font-medium text-navy">{c.title}</td>
                <td className="py-2"><span className="flex gap-1">{c.steps.map((s) => <Icon key={s.id} name={STEP_ICON[s.type]} size={18} />)}</span></td>
                <td className="py-2 text-muted">{c.steps[1].tools.map((t) => TOOL_LABELS[t]).join(", ") || "–"}</td>
                <td className="py-2 text-muted">{c.steps[0].publishedMonth}</td>
                <td className="py-2">
                  {(["video", "ovning", "quiz"] as const).filter((t) => rows[`${c.id}-${t}`]).length > 0 ? (
                    <span className="chip bg-good/15 text-good">
                      Eget: {(["video", "ovning", "quiz"] as const).filter((t) => rows[`${c.id}-${t}`]).map((t) => STEP_LABELS[t].toLowerCase()).join(", ")}
                    </span>
                  ) : (
                    <span className="chip bg-warn/15 text-warn">Platshållare</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Customers() {
  const { state, tier, reset } = useStore();
  return (
    <div className="space-y-4">
      <article className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-wine text-lg font-bold text-white">{state.parent.name[0]}</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-navy">{state.parent.name}</p>
            <p className="text-sm text-muted">{state.parent.email}</p>
          </div>
          <span className="chip bg-navy text-white">{TIERS[tier].name}</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {state.students.map((s) => {
            const p = state.progress[s.id] ?? emptyProgress();
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-sm">
                <Icon name="elev" size={24} />
                <span className="flex-1">
                  <b className="text-navy">{s.name}</b> · åk {s.grade}
                </span>
                <span className="text-muted">
                  {Object.keys(p.completed).length} steg · {p.quizResults.length} quiz
                </span>
              </div>
            );
          })}
        </div>
      </article>
      <p className="text-sm text-muted">Det här är demodata. Riktiga kunder visas här när inloggning för föräldrar är kopplad till databasen.</p>
      <button className="btn-ghost text-sm" onClick={() => confirm("Återställ all demodata?") && reset()}>
        Återställ demodata
      </button>
    </div>
  );
}
