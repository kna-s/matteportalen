"use client";

import { useState } from "react";
import { AREAS, CHAPTERS, GRADES, Grade, STEP_ICONS, STEP_LABELS, StepType, TOOL_LABELS, ToolId, chaptersFor } from "@/lib/curriculum";
import { emptyProgress, useStore } from "@/lib/store";
import { TIERS } from "@/lib/tiers";
import { Placeholder } from "./ui";

const TABS = [
  { id: "oversikt", label: "Översikt", icon: "📋" },
  { id: "innehall", label: "Innehåll", icon: "📚" },
  { id: "nytt", label: "Lägg upp nytt", icon: "➕" },
  { id: "kunder", label: "Kunder", icon: "👥" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function AdminPanel() {
  const [tab, setTab] = useState<TabId>("oversikt");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">🛠️ Administration</h1>
        <p className="mt-1 text-muted">Här lägger ni upp nytt innehåll varje månad och har koll på kunderna.</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-xl bg-paper p-1 shadow-sm sm:inline-flex" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === t.id ? "bg-navy text-white" : "text-navy hover:bg-cream"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {tab === "oversikt" && <Overview goTo={setTab} />}
      {tab === "innehall" && <ContentList />}
      {tab === "nytt" && <NewContent />}
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
          <h2 className="text-lg font-bold">🗓️ Månadens uppdatering ({thisMonth})</h2>
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
            <button onClick={() => goTo("nytt")} className="btn-accent">
              ➕ Lägg upp nytt innehåll
            </button>
            <button onClick={() => goTo("innehall")} className="btn-ghost">
              📚 Se allt innehåll
            </button>
            <button onClick={() => goTo("kunder")} className="btn-ghost">
              👥 Se kunder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentList() {
  const [grade, setGrade] = useState<Grade>(4);
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
                <td className="py-2">{AREAS.find((a) => a.id === c.areaId)?.emoji}</td>
                <td className="py-2 font-medium text-navy">{c.title}</td>
                <td className="py-2">{c.steps.map((s) => STEP_ICONS[s.type]).join(" ")}</td>
                <td className="py-2 text-muted">{c.steps[1].tools.map((t) => TOOL_LABELS[t]).join(", ") || "–"}</td>
                <td className="py-2 text-muted">{c.steps[0].publishedMonth}</td>
                <td className="py-2">
                  <span className="chip bg-warn/15 text-warn">Platshållare</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewContent() {
  const [type, setType] = useState<StepType>("video");
  const [grade, setGrade] = useState<Grade>(4);
  const [areaId, setAreaId] = useState(AREAS[0].id);
  const [tools, setTools] = useState<ToolId[]>([]);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="card space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <h2 className="text-lg font-bold">Lägg upp nytt innehåll</h2>

      <div>
        <p className="mb-2 text-sm font-semibold text-navy">Typ</p>
        <div className="flex flex-wrap gap-2">
          {(["video", "ovning", "quiz"] as StepType[]).map((t) => (
            <button type="button" key={t} onClick={() => setType(t)} className={type === t ? "btn-primary !py-1.5 text-sm" : "btn-ghost !py-1.5 text-sm"}>
              {STEP_ICONS[t]} {STEP_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-semibold text-navy">Årskurs</span>
          <select className="input mt-1" value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Åk {g}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-semibold text-navy">Område</span>
          <select className="input mt-1" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-semibold text-navy">Kapitel</span>
          <select className="input mt-1">
            {chaptersFor(grade, areaId).map((c) => (
              <option key={c.id}>{c.title}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-semibold text-navy">Titel</span>
        <input className="input mt-1" placeholder="T.ex. Så räknar du ut arean av en rektangel" />
      </label>

      {type === "video" && (
        <div className="rounded-xl border-2 border-dashed border-line p-8 text-center text-sm text-muted">
          <p className="text-3xl">🎬</p>
          <p className="mt-2">Dra hit en videofil eller klistra in en länk</p>
          <input className="input mx-auto mt-3 max-w-md" placeholder="https://…" />
        </div>
      )}
      {type === "ovning" && (
        <label className="block text-sm">
          <span className="font-semibold text-navy">Uppgifter (en per rad)</span>
          <textarea className="input mt-1 min-h-32" placeholder={"Rita en rektangel som är 4 cm lång och 3 cm bred.\nRäkna ut omkretsen."} />
        </label>
      )}
      {type === "quiz" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-navy">Fråga 1</p>
          <input className="input" placeholder="Frågan" />
          <div className="grid gap-2 sm:grid-cols-2">
            {["A", "B", "C", "D"].map((l, i) => (
              <label key={l} className="flex items-center gap-2">
                <input type="radio" name="ratt" defaultChecked={i === 0} className="accent-good" aria-label={`Svar ${l} är rätt`} />
                <input className="input" placeholder={`Svar ${l}`} />
              </label>
            ))}
          </div>
          <p className="text-xs text-muted">Markera rätt svar med rundeln. Fler frågor kan läggas till i nästa fas.</p>
        </div>
      )}

      {type !== "video" && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy">Hjälpmedel för uppgiften</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TOOL_LABELS) as ToolId[]).map((t) => (
              <label key={t} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${tools.includes(t) ? "border-navy bg-navy/5" : "border-line"}`}>
                <input
                  type="checkbox"
                  className="accent-navy"
                  checked={tools.includes(t)}
                  onChange={() => setTools((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))}
                />
                {TOOL_LABELS[t]}
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="block text-sm sm:w-60">
        <span className="font-semibold text-navy">Publiceras</span>
        <input type="month" className="input mt-1" defaultValue={new Date().toISOString().slice(0, 7)} />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-accent">Spara och publicera</button>
        <button type="button" className="btn-ghost">
          Spara som utkast
        </button>
      </div>
      {saved && <Placeholder>Demo: i nästa fas sparas innehållet i databasen och dyker upp för eleverna direkt.</Placeholder>}
    </form>
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
