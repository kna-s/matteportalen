"use client";

import Icon from "@/components/icons/Icon";
import PlanCards from "@/components/PlanCards";
import { useStore } from "@/lib/store";
import { TIERS } from "@/lib/tiers";
import { PageHeader, RequireLogin } from "@/components/ui";

export default function SubscriptionPage() {
  return (
    <div>
      <PageHeader icon="abonnemang" title="Mitt abonnemang" />
      <RequireLogin roles={["foralder"]}>
        <Content />
      </RequireLogin>
    </div>
  );
}

function Content() {
  const { state, tier, update } = useStore();
  const next = new Date();
  next.setMonth(next.getMonth() + 1, 1);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-3xl bg-navy p-6 text-white sm:grid-cols-3 sm:p-8">
        <div className="sm:col-span-1">
          <p className="text-sm text-white/70">Du har</p>
          <p className="font-serif text-4xl font-bold text-gold">{TIERS[tier].name}</p>
          <p className="text-white/80">{TIERS[tier].price}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
          <Icon name="foraldraportal" size={32} className="icon-invert" />
          <div>
            <p className="font-bold">{state.students.length} barn</p>
            <p className="text-sm text-white/70">på kontot</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
          <Icon name="kalender" size={32} className="icon-invert" />
          <div>
            <p className="font-bold">{tier === "gratis" ? "Ingen betalning" : next.toLocaleDateString("sv-SE", { day: "numeric", month: "long" })}</p>
            <p className="text-sm text-white/70">{tier === "gratis" ? "gratis för alltid" : "nästa betalning"}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Byt nivå</h2>
        <PlanCards current={tier} onChoose={(t) => update((s) => ({ ...s, parent: { ...s.parent, tier: t } }))} />
        <p className="mt-4 text-sm text-muted">
          Demo: nivån byts direkt utan betalning, så att du kan testa. Betalning med kort och Swish kopplas på i en senare fas. Du kan byta eller säga upp när du vill.
        </p>
      </section>
    </div>
  );
}
