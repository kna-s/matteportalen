"use client";

import Icon from "@/components/icons/Icon";
import { useState } from "react";
import { AREAS, CHAPTERS, GRADES, Grade, STEP_ICON, STEP_LABELS, StepType, TOOL_LABELS, chaptersFor } from "@/lib/curriculum";
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

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-muted">{label}</p>
      <p className="font-serif text-3xl font-bold text-navy">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Overview({ goTo }: { goTo: (t: TabId) => void }) {
  const { state } = useStore();
  const steps = CHAPTERS.flatMap((c) => c.steps);
  const count = (t: StepType) => steps.filter((s) => s.type === t).length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Föräldrakonton" value={1} sub="demodata" />
        <Stat label="Elevkonton" value={state.students.length} />
        <Stat label="Videolektioner" value={count("video")} sub="platshållare" />
        <Stat label="Quiz" value={count("quiz")} sub="platshållare" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Icon name="kalender" size={24} /> Månadens uppdatering ({thisMonth})</h2>
          <p className="mt-1 text-sm text-muted">Checklista för att publicera nytt material varje månad.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {["Spela in och ladda upp nya videolektioner", "Skriv övningar till de nya kapitlen", "Skapa nya quizfrågor", "Kontrollera hjälpmedel per uppgift", "Publicera"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-navy" aria-label={t} />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="card flex flex-col">
          <h2 className="text-lg font-bold">Snabbval</h2>
          <div className="mt-3 grid flex-1 gap-2">
            <button onClick={() => goTo("nytt")} className="btn-accent icon-invert">
              <Icon name="plus" size={20} /> Lägg upp nytt innehåll
            </button>
            <button onClick={() => goTo("innehall")} className="btn-ghost">
              <Icon name="kursplan" size={20} /> Se allt innehåll
            </button>
            <button onClick={() => goTo("kunder")} className="btn-ghost">
              <Icon name="foraldraportal" size={20} /> Se kunder
            </button>
          </div>
        </div>
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
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2 font-medium">Förälder</th>
              <th className="py-2 font-medium">E-post</th>
              <th className="py-2 font-medium">Abonnemang</th>
              <th className="py-2 font-medium">Barn</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line align-top">
              <td className="py-2 font-medium text-navy">{state.parent.name}</td>
              <td className="py-2 text-muted">{state.parent.email}</td>
              <td className="py-2">{TIERS[tier].name}</td>
              <td className="py-2">
                {state.students.map((s) => {
                  const p = state.progress[s.id] ?? emptyProgress();
                  return (
                    <div key={s.id}>
                      {s.name} (åk {s.grade}) · <span className="text-muted">{Object.keys(p.completed).length} steg, {p.quizResults.length} quiz</span>
                    </div>
                  );
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="btn-ghost text-sm" onClick={() => confirm("Återställ all demodata?") && reset()}>
        Återställ demodata
      </button>
    </div>
  );
}
