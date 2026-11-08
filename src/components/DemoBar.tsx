"use client";

import Link from "next/link";
import { PALETTES, Palette, useStore } from "@/lib/store";
import { TIERS, TIER_ORDER, Tier } from "@/lib/tiers";

/** Bara för demo: byt färgpalett och abonnemangsnivå snabbt. Tas bort i produktion. */
export default function DemoBar() {
  const { state, tier, update } = useStore();
  const showTier = state.session && state.session.role !== "admin";
  return (
    <div className={`fixed right-3 z-50 flex flex-wrap items-center gap-2 rounded-2xl border border-gold bg-paper px-3 py-1.5 text-xs shadow-lg lg:bottom-3 ${state.session ? "bottom-20" : "bottom-3"}`}>
      <span className="font-semibold text-gold-ink">Demo</span>
      <label className="flex items-center gap-1">
        <span className="text-muted">Färger:</span>
        <select
          aria-label="Byt färgpalett (demo)"
          className="rounded border border-line bg-paper px-1 py-0.5"
          value={state.palette}
          onChange={(e) => update((s) => ({ ...s, palette: e.target.value as Palette }))}
        >
          {PALETTES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <Link href="/designval" className="font-semibold text-wine underline">
        Jämför
      </Link>
      {showTier && (
        <label className="flex items-center gap-1">
          <span className="text-muted">Nivå:</span>
          <select
            aria-label="Byt abonnemangsnivå (demo)"
            className="rounded border border-line bg-paper px-1 py-0.5"
            value={tier}
            onChange={(e) => update((s) => ({ ...s, parent: { ...s.parent, tier: e.target.value as Tier } }))}
          >
            {TIER_ORDER.map((t) => (
              <option key={t} value={t}>
                {TIERS[t].name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
