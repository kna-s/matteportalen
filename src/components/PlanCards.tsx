"use client";

import Link from "next/link";
import { STEP_ICON, StepType } from "@/lib/curriculum";
import { TIERS, TIER_ORDER, Tier } from "@/lib/tiers";
import Icon from "./icons/Icon";

const FLOW: Record<Tier, StepType[]> = {
  gratis: ["video", "ovning"],
  start: ["video", "ovning"],
  plus: ["video", "ovning", "quiz"],
  premium: ["video", "ovning", "quiz", "screening"],
};

/** Prisplanerna, samma utseende på startsidan, prissidan och i abonnemanget. */
export default function PlanCards({ current, onChoose }: { current?: Tier; onChoose?: (t: Tier) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TIER_ORDER.map((t) => {
        const dark = t === "premium";
        const isCurrent = current === t;
        return (
          <div
            key={t}
            className={`relative flex flex-col rounded-3xl p-6 transition-shadow ${dark ? "bg-navy text-white shadow-xl" : "bg-paper ring-1 ring-line"} ${isCurrent ? "ring-4 ring-gold" : ""}`}
          >
            {dark && !isCurrent && <span className="chip absolute -top-3 left-6 bg-gold text-navy">Mest populär</span>}
            {isCurrent && <span className="chip absolute -top-3 left-6 bg-gold text-navy">Ditt abonnemang</span>}
            <h3 className={`text-xl font-bold ${dark ? "!text-white" : ""}`}>{TIERS[t].name}</h3>
            <p className={`mt-1 font-serif text-2xl font-bold ${dark ? "text-gold" : "text-wine"}`}>{TIERS[t].price}</p>
            <p className={`mt-2 text-sm ${dark ? "text-white/75" : "text-muted"}`}>{TIERS[t].tagline}</p>
            <div className={`mt-4 flex items-center gap-1 rounded-xl px-3 py-2 ${dark ? "bg-white/10" : "bg-cream"}`}>
              {t === "gratis" ? (
                <span className={`text-xs ${dark ? "text-white/80" : "text-muted"}`}>2 smakprov</span>
              ) : (
                FLOW[t].map((s, i) => (
                  <span key={s} className={`flex items-center gap-1 ${dark ? "icon-invert" : ""}`}>
                    {i > 0 && <span className={dark ? "text-white/50" : "text-muted"}>›</span>}
                    <Icon name={STEP_ICON[s]} size={20} />
                  </span>
                ))
              )}
            </div>
            <ul className="mt-4 flex-1 space-y-1.5 text-sm">
              {TIERS[t].features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className={dark ? "text-gold" : "text-good"}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {onChoose ? (
              <button
                disabled={isCurrent}
                onClick={() => onChoose(t)}
                className={`mt-5 ${isCurrent ? "btn border border-white/20 opacity-60" : dark ? "btn bg-gold text-navy hover:bg-gold-light" : "btn-ghost"}`}
              >
                {isCurrent ? "Nuvarande" : `Byt till ${TIERS[t].name}`}
              </button>
            ) : (
              <Link href="/logga-in?skapa=1" className={`mt-5 ${dark ? "btn bg-gold text-navy hover:bg-gold-light" : "btn-ghost"}`}>
                {t === "gratis" ? "Börja gratis" : `Välj ${TIERS[t].name}`}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
