"use client";

import Link from "next/link";
import { STEP_ICONS, StepType } from "@/lib/curriculum";
import { TIERS, TIER_ORDER, Tier } from "@/lib/tiers";

const ROWS: { label: string; tiers: Tier[] }[] = [
  { label: "Videolektioner", tiers: ["start", "plus", "premium"] },
  { label: "Övningar efter varje kapitel", tiers: ["start", "plus", "premium"] },
  { label: "Hjälpmedel (kalkylator, linjal m.m.)", tiers: ["start", "plus", "premium"] },
  { label: "Föräldraportal", tiers: ["gratis", "start", "plus", "premium"] },
  { label: "Självrättande quiz", tiers: ["plus", "premium"] },
  { label: "Kort kommentar efter quiz", tiers: ["plus", "premium"] },
  { label: "Full screening per kapitel, område och årskurs", tiers: ["premium"] },
  { label: "Individuell träningsplan", tiers: ["premium"] },
];

const FLOW: Record<Tier, StepType[]> = {
  gratis: ["video", "ovning"],
  start: ["video", "ovning"],
  plus: ["video", "ovning", "quiz"],
  premium: ["video", "ovning", "quiz", "screening"],
};

export default function PricingPage() {
  return (
    <div>
      <div className="text-center">
        <h1 className="page-title">Priser</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">Börja gratis. Abonnemanget betalas månadsvis, gäller alla barn på kontot och kan sägas upp när som helst.</p>
      </div>
      <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="p-4" />
              {TIER_ORDER.map((t) => (
                <th key={t} className={`p-4 text-center ${t === "premium" ? "bg-gold-light/50" : ""}`}>
                  <span className="block font-serif text-xl text-navy">{TIERS[t].name}</span>
                  <span className="text-sm font-semibold text-wine">{TIERS[t].price}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-0">
                <td className="p-4 text-sm">{r.label}</td>
                {TIER_ORDER.map((t) => (
                  <td key={t} className={`p-4 text-center ${t === "premium" ? "bg-gold-light/30" : ""}`}>
                    {r.tiers.includes(t) ? <span className="text-good">✓</span> : <span className="text-line">—</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="p-4 text-sm text-muted">Flöde i varje kapitel</td>
              {TIER_ORDER.map((t) => (
                <td key={t} className={`p-4 text-center text-sm ${t === "premium" ? "bg-gold-light/30" : ""}`}>
                  {t === "gratis" ? "2 smakprov" : FLOW[t].map((s) => STEP_ICONS[s]).join(" → ")}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4" />
              {TIER_ORDER.map((t) => (
                <td key={t} className={`p-4 text-center ${t === "premium" ? "bg-gold-light/30" : ""}`}>
                  <Link href="/logga-in?skapa=1" className={t === "premium" ? "btn-accent !px-4 text-sm" : "btn-ghost !px-4 text-sm"}>
                    {t === "gratis" ? "Börja gratis" : "Välj"}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
