// Skattjakten: varje område är en ö, varje klart kapitel ger en nyckel och
// varje ö har en skattkista med ett föremål till maskoten.

import { AREAS, Grade, chaptersFor } from "./curriculum";
import { StudentProgress } from "./store";
import { BADGES } from "./badges";
import { Tier, canAccess } from "./tiers";

export type Slot = "hatt" | "halsduk" | "glasogon";

export const SLOT_LABELS: Record<Slot, string> = { hatt: "Hattar", halsduk: "Halsdukar", glasogon: "Glasögon" };

export type Unlock = { type: "start" } | { type: "area"; areaId: string } | { type: "badges"; count: number };

export interface Accessory {
  id: string;
  slot: Slot;
  name: string;
  /** Färg för halsdukar. */
  color?: string;
  unlock: Unlock;
}

export const ACCESSORIES: Accessory[] = [
  { id: "halsduk-orange", slot: "halsduk", name: "Orange halsduk", color: "var(--color-wine)", unlock: { type: "start" } },
  { id: "halsduk-bla", slot: "halsduk", name: "Blå halsduk", color: "#1d7a94", unlock: { type: "start" } },
  { id: "kaptenshatt", slot: "hatt", name: "Kaptenshatt", unlock: { type: "area", areaId: "taluppfattning" } },
  { id: "keps", slot: "hatt", name: "Grön keps", unlock: { type: "area", areaId: "algebra" } },
  { id: "runda-glasogon", slot: "glasogon", name: "Runda glasögon", unlock: { type: "area", areaId: "geometri" } },
  { id: "trollkarlshatt", slot: "hatt", name: "Trollkarlshatt", unlock: { type: "area", areaId: "sannolikhet" } },
  { id: "solglasogon", slot: "glasogon", name: "Solglasögon", unlock: { type: "area", areaId: "samband" } },
  { id: "krona", slot: "hatt", name: "Krona", unlock: { type: "area", areaId: "problemlosning" } },
  { id: "halsduk-lila", slot: "halsduk", name: "Lila halsduk", color: "#7a5fc2", unlock: { type: "badges", count: 3 } },
  { id: "halsduk-guld", slot: "halsduk", name: "Guldhalsduk", color: "#d9a21b", unlock: { type: "badges", count: 6 } },
  { id: "partyhatt", slot: "hatt", name: "Partyhatt", unlock: { type: "badges", count: 10 } },
];

export function getAccessory(id?: string | null) {
  return ACCESSORIES.find((a) => a.id === id);
}

export interface Outfit {
  hatt?: string | null;
  halsduk?: string | null;
  glasogon?: string | null;
}

export const DEFAULT_OUTFIT: Outfit = { halsduk: "halsduk-orange" };

export interface TreasureCtx {
  p: StudentProgress;
  grade: Grade;
  tier: Tier;
  unlockAll?: boolean;
}

export function chapterDone(ctx: TreasureCtx, chapterId: string) {
  const ch = chaptersFor(ctx.grade).find((c) => c.id === chapterId);
  if (!ch) return false;
  const steps = ch.steps.filter((s) => canAccess(ctx.tier, s, ch.id));
  return steps.length > 0 && steps.every((s) => ctx.p.completed[s.id]);
}

export interface IslandState {
  areaId: string;
  keys: number;
  total: number;
  chestReady: boolean;
  reward?: Accessory;
}

export function islands(ctx: TreasureCtx): IslandState[] {
  return AREAS.map((a) => {
    const chs = chaptersFor(ctx.grade, a.id);
    const keys = ctx.unlockAll ? chs.length : chs.filter((c) => chapterDone(ctx, c.id)).length;
    return {
      areaId: a.id,
      keys,
      total: chs.length,
      chestReady: keys === chs.length,
      reward: ACCESSORIES.find((x) => x.unlock.type === "area" && x.unlock.areaId === a.id),
    };
  });
}

export function totalKeys(ctx: TreasureCtx) {
  return islands(ctx).reduce((s, i) => s + i.keys, 0);
}

export function isUnlocked(ctx: TreasureCtx, acc: Accessory) {
  if (ctx.unlockAll || acc.unlock.type === "start") return true;
  if (acc.unlock.type === "area") {
    const isl = islands(ctx).find((i) => i.areaId === (acc.unlock as { areaId: string }).areaId);
    return !!isl?.chestReady;
  }
  const earned = BADGES.filter((b) => b.earned({ p: ctx.p, grade: ctx.grade, tier: ctx.tier })).length;
  return earned >= acc.unlock.count;
}

export function unlockHint(acc: Accessory) {
  if (acc.unlock.type === "start") return "Finns från början";
  if (acc.unlock.type === "area") {
    const area = AREAS.find((a) => a.id === (acc.unlock as { areaId: string }).areaId);
    return `Öppna skattkistan på ön ${area?.title}`;
  }
  return `Samla ${acc.unlock.count} märken`;
}
