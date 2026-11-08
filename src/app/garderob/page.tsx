"use client";

import { useState } from "react";
import Icon from "@/components/icons/Icon";
import Mascot from "@/components/Mascot";
import { RequireLogin } from "@/components/ui";
import { useTreasure } from "@/components/Treasure";
import { ACCESSORIES, Outfit, SLOT_LABELS, Slot, isUnlocked, unlockHint } from "@/lib/treasure";
import { useStore } from "@/lib/store";

export default function WardrobePage() {
  return (
    <RequireLogin roles={["elev"]}>
      <Wardrobe />
    </RequireLogin>
  );
}

function Wardrobe() {
  const { state } = useStore();
  const { ctx, outfit, setOutfit } = useTreasure();
  const [slot, setSlot] = useState<Slot>("hatt");
  const unlockedCount = ACCESSORIES.filter((a) => isUnlocked(ctx, a)).length;
  const items = ACCESSORIES.filter((a) => a.slot === slot);

  if (state.mascot !== "sigge")
    return <p className="card text-muted">Garderoben finns just nu bara för Sigge. Byt maskot till Sigge i demopanelen för att testa.</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="ocean flex flex-col items-center rounded-[2rem] p-6 text-center lg:sticky lg:top-20 lg:self-start">
        <h1 className="text-2xl font-bold">Sigges garderob</h1>
        <div className="my-4 rounded-full bg-paper/70 p-4">
          <Mascot mood="glad" size={200} outfit={outfit} />
        </div>
        <p className="rounded-full bg-paper px-4 py-1.5 text-sm font-semibold text-navy">
          {unlockedCount} av {ACCESSORIES.length} saker upplåsta
        </p>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(SLOT_LABELS) as Slot[]).map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={slot === s ? "btn-primary !py-2" : "btn-ghost !py-2"}>
              {SLOT_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slot !== "halsduk" && (
            <button
              onClick={() => setOutfit({ ...outfit, [slot]: null })}
              className={`flex flex-col items-center rounded-3xl bg-paper p-4 ring-2 transition-all hover:-translate-y-0.5 ${!outfit[slot] ? "ring-navy" : "ring-transparent"}`}
            >
              <Mascot mood="glad" size={90} animate={false} outfit={{ ...outfit, [slot]: null } as Outfit} />
              <span className="mt-1 font-semibold text-navy">Ingen</span>
            </button>
          )}
          {items.map((a) => {
            const open = isUnlocked(ctx, a);
            const worn = outfit[a.slot] === a.id;
            return (
              <button
                key={a.id}
                disabled={!open}
                onClick={() => setOutfit({ ...outfit, [a.slot]: a.id })}
                className={`relative flex flex-col items-center rounded-3xl p-4 ring-2 transition-all ${
                  open ? `bg-paper hover:-translate-y-0.5 ${worn ? "ring-navy" : "ring-transparent"}` : "cursor-not-allowed bg-cream ring-transparent"
                }`}
              >
                <span className={open ? "" : "opacity-40 grayscale"}>
                  <Mascot mood="glad" size={90} animate={false} outfit={{ ...outfit, [a.slot]: a.id }} />
                </span>
                <span className={`mt-1 font-semibold ${open ? "text-navy" : "text-muted"}`}>{a.name}</span>
                {!open && (
                  <span className="mt-1 flex items-center gap-1 text-center text-xs text-muted">
                    <Icon name="las" size={14} /> {unlockHint(a)}
                  </span>
                )}
                {worn && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-navy text-xs text-white">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
