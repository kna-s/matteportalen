"use client";

import Link from "next/link";
import { useState } from "react";
import { BADGES } from "@/lib/badges";
import { MASCOTS, MascotId, PALETTES, Palette, useStore } from "@/lib/store";
import { TIERS, TIER_ORDER, Tier } from "@/lib/tiers";

/** Bara för demo: byt färger, maskot, nivå och testa märkesnotiser. Tas bort i produktion. */
export default function DemoBar() {
  const { state, tier, update, reset } = useStore();
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState(BADGES[0].id);
  const showTier = state.session && state.session.role !== "admin";
  const pos = state.session ? "top-[4.25rem]" : "bottom-3";

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className={`fixed right-3 z-50 flex items-center gap-1.5 rounded-full border border-gold bg-paper px-3 py-2 text-xs font-semibold text-gold-ink shadow-lg hover:bg-gold-light ${pos}`}
      >
        🎛️ Demo
      </button>
    );

  const row = "flex items-center justify-between gap-3";
  const sel = "rounded-lg border border-line bg-paper px-2 py-1 text-xs";

  return (
    <div className={`fixed right-3 z-50 w-72 rounded-2xl border border-gold bg-paper p-4 text-xs shadow-xl ${pos}`} role="dialog" aria-label="Demoinställningar">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-gold-ink">🎛️ Demoinställningar</p>
        <button onClick={() => setOpen(false)} aria-label="Stäng" className="text-base text-muted hover:text-ink">
          ✕
        </button>
      </div>
      <div className="space-y-2.5">
        <label className={row}>
          <span className="font-semibold text-navy">Färger</span>
          <select className={sel} value={state.palette} onChange={(e) => update((s) => ({ ...s, palette: e.target.value as Palette }))}>
            {PALETTES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className={row}>
          <span className="font-semibold text-navy">Maskot</span>
          <select className={sel} value={state.mascot} onChange={(e) => update((s) => ({ ...s, mascot: e.target.value as MascotId }))}>
            {MASCOTS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.kind})
              </option>
            ))}
          </select>
        </label>
        {showTier && (
          <label className={row}>
            <span className="font-semibold text-navy">Nivå</span>
            <select className={sel} value={tier} onChange={(e) => update((s) => ({ ...s, parent: { ...s.parent, tier: e.target.value as Tier } }))}>
              {TIER_ORDER.map((t) => (
                <option key={t} value={t}>
                  {TIERS[t].name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="border-t border-line pt-2.5">
          <p className="mb-1.5 font-semibold text-navy">Testa märkesnotis</p>
          <div className="flex gap-2">
            <select className={`${sel} min-w-0 flex-1`} value={badge} onChange={(e) => setBadge(e.target.value)} aria-label="Välj märke att testa">
              {BADGES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.name}
                </option>
              ))}
            </select>
            <button onClick={() => update((s) => ({ ...s, demoBadge: badge }))} className="rounded-lg bg-wine px-3 py-1 font-semibold text-white hover:bg-wine-light">
              Visa
            </button>
          </div>
          <button
            onClick={() => update((s) => ({ ...s, demoBadge: BADGES[Math.floor(Math.random() * BADGES.length)].id }))}
            className="mt-1.5 text-wine underline"
          >
            Slumpa ett märke
          </button>
        </div>
        <div className="border-t border-line pt-2.5">
          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold text-navy">Lås upp alla skattkistor</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-wine"
              checked={!!state.demoUnlockAll}
              onChange={(e) => update((s) => ({ ...s, demoUnlockAll: e.target.checked }))}
            />
          </label>
          <button onClick={() => update((s) => ({ ...s, openedChests: {}, outfits: {} }))} className="mt-1.5 text-wine underline">
            Stäng kistorna och nollställ Sigges kläder
          </button>
        </div>
        <div className="flex gap-3 border-t border-line pt-2.5">
          <Link href="/designval" className="font-semibold text-navy underline">
            Jämför färger
          </Link>
          <Link href="/maskot" className="font-semibold text-navy underline">
            Jämför maskotar
          </Link>
        </div>
        <button
          onClick={() => {
            if (confirm("Återställ exempelfamiljen (Anna, Leo och Maja)? Allt du har testat försvinner.")) reset();
          }}
          className="w-full rounded-lg border border-line py-1.5 font-semibold text-wine hover:bg-cream"
        >
          Återställ demodata
        </button>
      </div>
    </div>
  );
}
