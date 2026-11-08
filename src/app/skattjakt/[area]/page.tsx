"use client";

import { useParams } from "next/navigation";
import { AREAS } from "@/lib/curriculum";
import { RequireLogin, StudentPicker } from "@/components/ui";
import { IslandView } from "@/components/Treasure";

export default function IslandPage() {
  const { area } = useParams<{ area: string }>();
  if (!AREAS.some((a) => a.id === area)) return <p>Ön finns inte.</p>;
  return (
    <RequireLogin>
      <StudentPicker />
      <IslandView areaId={area} />
    </RequireLogin>
  );
}
