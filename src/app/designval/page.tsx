"use client";

import { PALETTES, useStore } from "@/lib/store";
import Mascot from "@/components/Mascot";

/** Jämför färgpaletterna sida vid sida, med både föräldra- och elevuttryck (stil D). */
export default function DesignChoicePage() {
  const { state, update } = useStore();
  return (
    <div>
      <h1 className="page-title">Välj färger</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Varje kort visar samma delar i olika paletter: marknadssidan för föräldrar (lugn) och elevens startsida (varmare, med Pi). Klicka på ”Använd” för att se hela
        sajten i den paletten.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {PALETTES.map((p) => (
          <div key={p.id} data-palette={p.id} className="overflow-hidden rounded-3xl border border-line bg-cream shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-paper px-5 py-3">
              <div>
                <p className="font-serif text-lg font-bold text-navy">{p.name}</p>
                <p className="text-xs text-muted">{p.desc}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {["navy", "wine", "gold", "gold-light", "cream"].map((c) => (
                  <span key={c} className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: `var(--color-${c})` }} title={c} />
                ))}
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {/* Förälder/marknad */}
              <div className="rounded-2xl bg-paper p-4 ring-1 ring-line">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-wine">För föräldrar</p>
                <p className="mt-1 font-serif text-xl font-bold leading-tight text-navy">
                  Matte som känns <span className="text-wine">lugn</span>.
                </p>
                <p className="mt-1 text-xs text-muted">Korta lektioner som följer kursplanen.</p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-lg bg-wine px-3 py-1.5 text-xs font-semibold text-white">Prova gratis</span>
                  <span className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy">Läs mer</span>
                </div>
                <div className="mt-3 rounded-xl bg-navy p-3 text-white">
                  <p className="text-[0.65rem] text-gold">Så funkar det</p>
                  <p className="text-sm font-semibold">🎥 → ✏️ → 🏆 → 🧠</p>
                </div>
              </div>

              {/* Elev */}
              <div className="rounded-2xl bg-gold-light/60 p-4">
                <div className="flex items-center gap-2">
                  <Mascot size={44} mood="glad" />
                  <p className="font-serif text-lg font-bold text-navy">Hej Leo!</p>
                </div>
                <div className="mt-3 rounded-2xl bg-navy p-3 text-white">
                  <p className="text-[0.65rem] uppercase tracking-wider text-gold">Nästa steg</p>
                  <p className="text-sm font-semibold">🎥 Omkrets och area</p>
                  <span className="mt-2 inline-block rounded-lg bg-gold px-3 py-1 text-xs font-bold text-navy">Fortsätt →</span>
                </div>
                <div className="mt-3 flex items-center">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex flex-1 items-center last:flex-none">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                          n < 3 ? "bg-good text-white" : n === 3 ? "bg-gold text-navy ring-4 ring-gold/30" : "bg-paper text-muted"
                        }`}
                      >
                        {n < 3 ? "✓" : n}
                      </span>
                      {n < 4 && <span className={`h-1 flex-1 ${n < 3 ? "bg-good" : "bg-line"}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-line bg-paper px-5 py-3">
              <span className="text-xs text-muted">{state.palette === p.id ? "✓ Används nu" : ""}</span>
              <button onClick={() => update((s) => ({ ...s, palette: p.id }))} disabled={state.palette === p.id} className="btn-primary !px-4 !py-1.5 text-sm">
                Använd
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
