"use client";

import Mascot, { Mood } from "@/components/Mascot";
import { MASCOTS, useStore } from "@/lib/store";

const MOODS: { id: Mood; label: string; text: string }[] = [
  { id: "glad", label: "Hälsar", text: "Hej! Ska vi ta nästa steg?" },
  { id: "hurra", label: "Firar", text: "Alla rätt! Snyggt jobbat!" },
  { id: "tanker", label: "Uppmuntrar", text: "Hmm, nästan! Testa igen." },
];

/** Jämför maskotarna i tre olika humör. */
export default function MascotChoicePage() {
  const { state, update } = useStore();
  return (
    <div>
      <h1 className="page-title">Välj maskot</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Fyra förslag på maskotar, ritade i sajtens färger. Varje maskot visas när den hälsar, firar och uppmuntrar. Klicka på ”Använd” för att se den på hela sajten.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {MASCOTS.map((m) => {
          const active = state.mascot === m.id;
          return (
            <div key={m.id} className={`overflow-hidden rounded-3xl bg-paper shadow-sm ring-1 ${active ? "ring-2 ring-wine" : "ring-line"}`}>
              <div className="flex items-center gap-4 bg-gold-light/50 p-5">
                <Mascot kind={m.id} mood="glad" size={110} />
                <div>
                  <p className="font-serif text-2xl font-bold text-navy">{m.name}</p>
                  <p className="text-sm font-semibold capitalize text-wine">{m.kind}</p>
                  <p className="mt-1 text-sm text-muted">{m.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4">
                {MOODS.map((mo) => (
                  <div key={mo.id} className="flex flex-col items-center rounded-2xl bg-cream p-3 text-center">
                    <Mascot kind={m.id} mood={mo.id} size={72} />
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-navy">{mo.label}</p>
                    <p className="mt-0.5 text-[0.7rem] leading-snug text-muted">”{mo.text}”</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <span className="text-xs text-muted">{active ? "✓ Används nu" : ""}</span>
                <button disabled={active} onClick={() => update((s) => ({ ...s, mascot: m.id }))} className="btn-primary !px-4 !py-1.5 text-sm">
                  Använd
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
