"use client";

import Icon from "@/components/icons/Icon";
import { STEP_ICON } from "@/lib/curriculum";
import { useStore } from "@/lib/store";
import { TIERS, TIER_ORDER, Tier } from "@/lib/tiers";
import { PageHeader, RequireLogin } from "@/components/ui";

const FLOW: Record<Tier, string[]> = {
  gratis: ["video", "ovning"],
  start: ["video", "ovning"],
  plus: ["video", "ovning", "quiz"],
  premium: ["video", "ovning", "quiz", "screening"],
};

export default function SubscriptionPage() {
  return (
    <div>
      <PageHeader icon="abonnemang" title="Mitt abonnemang" intro="Betalas månadsvis och gäller alla barn på kontot." />
      <RequireLogin roles={["foralder"]}>
        <Content />
      </RequireLogin>
    </div>
  );
}

function Content() {
  const { tier, update } = useStore();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TIER_ORDER.map((t) => {
          const info = TIERS[t];
          const current = t === tier;
          return (
            <div key={t} className={`card flex flex-col ${current ? "border-navy ring-2 ring-navy" : t === "premium" ? "border-gold" : ""}`}>
              {t === "premium" && <span className="chip mb-2 self-start bg-gold-light text-gold-ink">Mest komplett</span>}
              <h2 className="text-2xl font-bold">{info.name}</h2>
              <p className="text-xl font-semibold text-wine">{info.price}</p>
              <p className="mt-1 text-sm text-muted">{info.tagline}</p>
              <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                {info.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-good">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1">Flöde: {FLOW[t].map((s, i) => <span key={s} className="inline-flex items-center gap-1">{i > 0 && "→"}<Icon name={STEP_ICON[s as keyof typeof STEP_ICON]} size={18} /></span>)}</span>
              </p>
              <button
                disabled={current}
                onClick={() => update((s) => ({ ...s, parent: { ...s.parent, tier: t } }))}
                className={`mt-4 ${current ? "btn-ghost" : "btn-primary"}`}
              >
                {current ? "Ditt abonnemang" : `Välj ${info.name}`}
              </button>
            </div>
          );
        })}
      </div>
      <div className="card text-sm text-muted">
        <b className="text-navy">Demo:</b> i den här versionen byter du nivå direkt utan betalning, så att du kan testa hur sidan ser ut för varje nivå.
        Betalning med kort och Swish kopplas på i en senare fas.
      </div>
    </div>
  );
}
