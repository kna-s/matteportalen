"use client";

import { BRAND } from "@/lib/brand";
import { RequireLogin, StudentPicker } from "@/components/ui";
import { TreasureMap } from "@/components/Treasure";
import Icon from "@/components/icons/Icon";

export default function TreasureMapPage() {
  return (
    <RequireLogin>
      <StudentPicker />
      <h1 className="page-title mb-4">{BRAND.adventure}</h1>
      <div className="mb-5">
        <p className="flex items-center gap-2 font-medium text-navy">
          <Icon name="kartbit" size={26} className="shrink-0" />
          Varje kapitel du klarar ger en kartbit. Samla alla bitar på en ö så blir kartan hel och visar vägen till skattkistan!
        </p>
      </div>
      <TreasureMap />
    </RequireLogin>
  );
}
