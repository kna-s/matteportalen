"use client";

import Link from "next/link";
import PlanCards from "@/components/PlanCards";
import { TIERS, TIER_ORDER, Tier } from "@/lib/tiers";

const ROWS: { label: string; tiers: Tier[] }[] = [
  { label: "Videolektioner", tiers: ["start", "plus", "premium"] },
  { label: "Övningar efter varje kapitel", tiers: ["start", "plus", "premium"] },
  { label: "Hjälpmedel som kalkylator och linjal", tiers: ["start", "plus", "premium"] },
  { label: "Äventyret med nycklar och skattkistor", tiers: ["gratis", "start", "plus", "premium"] },
  { label: "Föräldraportal och veckorapport", tiers: ["gratis", "start", "plus", "premium"] },
  { label: "Självrättande quiz", tiers: ["plus", "premium"] },
  { label: "Full screening och träningsplan", tiers: ["premium"] },
];

export default function PricingPage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="page-title">Priser</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">Börja gratis. Betalas månadsvis, gäller alla barn på kontot och kan sägas upp när som helst.</p>
      </div>

      <PlanCards />

      <section>
        <h2 className="mb-4 text-center text-xl font-bold">Jämför</h2>
        <div className="overflow-x-auto rounded-3xl bg-paper ring-1 ring-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr>
                <th className="p-4" />
                {TIER_ORDER.map((t) => (
                  <th key={t} className={`p-4 text-center font-serif text-base text-navy ${t === "premium" ? "bg-navy/5" : ""}`}>
                    {TIERS[t].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.label} className={i % 2 ? "bg-cream/50" : ""}>
                  <td className="p-4">{r.label}</td>
                  {TIER_ORDER.map((t) => (
                    <td key={t} className={`p-4 text-center ${t === "premium" ? "bg-navy/5" : ""}`}>
                      {r.tiers.includes(t) ? (
                        <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-good/15 font-bold text-good">✓</span>
                      ) : (
                        <span className="text-line">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-3xl bg-wine p-8 text-center text-white">
        <h2 className="text-2xl font-bold !text-white">Testa gratis först</h2>
        <p className="mt-1 text-white/85">Två videolektioner och två övningar, utan betalkort.</p>
        <Link href="/logga-in?skapa=1" className="btn mt-4 bg-gold text-navy hover:bg-gold-light">
          Skapa gratiskonto →
        </Link>
      </div>
    </div>
  );
}
