"use client";

import { useStore } from "@/lib/store";
import { TIERS, TIER_ORDER, Tier } from "@/lib/tiers";

/** Bara för demo: byt abonnemangsnivå snabbt för att testa flödet. Tas bort i produktion. */
export default function DemoBar() {
  const { state, tier, update } = useStore();
  if (!state.session || state.session.role === "admin") return null;
  return (
    <div className="fixed bottom-20 right-3 z-50 lg:bottom-3 flex items-center gap-2 rounded-full border border-gold bg-paper px-3 py-1.5 text-xs shadow-lg">
      <span className="font-semibold text-[#6b5410]">Demo-nivå:</span>
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
    </div>
  );
}
