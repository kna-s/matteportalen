"use client";

import Mascot, { Mood } from "@/components/Mascot";
import { SiggeSida, SiggeSkal, SiggeStaende } from "@/components/SiggeVariants";

/** FÖRHANDSVISNING: välj kropp för Sigge. */

const MOODS: { id: Mood; label: string }[] = [
  { id: "glad", label: "Hälsar" },
  { id: "hurra", label: "Firar" },
  { id: "tanker", label: "Uppmuntrar" },
];

const VARIANTS: { id: string; name: string; desc: string; render: (mood: Mood, size: number) => React.ReactNode }[] = [
  {
    id: "a",
    name: "A. Nuvarande",
    desc: "Rakt framifrån, stort huvud framför ett platt skal.",
    render: (mood, size) => <Mascot kind="sigge" mood={mood} size={size} />,
  },
  {
    id: "b",
    name: "B. Stående",
    desc: "Står upp som en tecknad figur. Magen syns framifrån och skalet sticker ut bakom. Har armar och ben, så den kan göra mycket kroppsspråk.",
    render: (mood, size) => (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <SiggeStaende mood={mood} />
      </svg>
    ),
  },
  {
    id: "c",
    name: "C. Från sidan",
    desc: "Klassisk sköldpaddsform som kryper framåt. Tydligast att det är en sköldpadda, och passar budskapet om att ta ett steg i taget.",
    render: (mood, size) => (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <SiggeSida mood={mood} />
      </svg>
    ),
  },
  {
    id: "d",
    name: "D. Tittar ut ur skalet",
    desc: "Rund och mjuk. Skalet är nästan hela kroppen och Sigge kikar ut. Gosig och enkel att känna igen även i liten storlek.",
    render: (mood, size) => (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <SiggeSkal mood={mood} />
      </svg>
    ),
  },
];

export default function SiggePreview() {
  return (
    <div>
      <span className="chip bg-gold-light text-gold-ink">Förhandsvisning</span>
      <h1 className="page-title mt-3">Sigges kropp</h1>
      <p className="mt-2 max-w-2xl text-muted">Fyra olika kroppar för Sigge, i samma färger och med samma ansikte. Varje variant visas när den hälsar, firar och uppmuntrar, och i liten storlek som i menyn.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {VARIANTS.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-3xl bg-paper shadow-sm ring-1 ring-line">
            <div className="flex items-center gap-5 bg-gold-light/50 p-5">
              <div className="shrink-0">{v.render("glad", 130)}</div>
              <div>
                <p className="font-serif text-2xl font-bold text-navy">{v.name}</p>
                <p className="mt-1 text-sm text-muted">{v.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4">
              {MOODS.map((m) => (
                <div key={m.id} className="flex flex-col items-center rounded-2xl bg-cream p-3">
                  {v.render(m.id, 84)}
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-navy">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-line px-5 py-3 text-sm text-muted">
              Litet format:
              {v.render("glad", 40)}
              {v.render("glad", 28)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
