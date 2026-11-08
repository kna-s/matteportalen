"use client";

import { BRAND } from "@/lib/brand";
import { RequireLogin, StudentPicker } from "@/components/ui";
import { TreasureMap } from "@/components/Treasure";
import { MascotSays } from "@/components/Mascot";

export default function TreasureMapPage() {
  return (
    <RequireLogin>
      <StudentPicker />
      <h1 className="page-title mb-4">{BRAND.adventure}</h1>
      <div className="mb-5">
        <MascotSays mood="glad">Varje kapitel du klarar ger en kartbit. Samla alla bitar på en ö så blir kartan hel och visar vägen till skattkistan!</MascotSays>
      </div>
      <TreasureMap />
    </RequireLogin>
  );
}
