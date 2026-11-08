"use client";

import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { useState } from "react";
import { AREAS, Grade, chaptersFor, getArea } from "@/lib/curriculum";
import { continuePoint, stepHref } from "@/lib/flow";
import { emptyProgress, useStore } from "@/lib/store";
import { canAccess } from "@/lib/tiers";
import { Accessory, IslandState, Outfit, TreasureCtx, chapterDone, islands, totalKeys } from "@/lib/treasure";
import Icon from "./icons/Icon";
import Mascot from "./Mascot";
import { Confetti } from "./Badges";

/** Samlar allt skattjakten behöver för den aktuella eleven. */
export function useTreasure() {
  const { state, tier, currentStudent, update } = useStore();
  const sid = currentStudent?.id;
  const p = (sid && state.progress[sid]) || emptyProgress();
  const grade = (currentStudent?.grade ?? 4) as Grade;
  const ctx: TreasureCtx = { p, grade, tier, unlockAll: state.demoUnlockAll };
  const outfit: Outfit = (sid && state.outfits?.[sid]) || { halsduk: "halsduk-orange" };
  const opened = (sid && state.openedChests?.[sid]) || [];
  const setOutfit = (o: Outfit) => sid && update((s) => ({ ...s, outfits: { ...s.outfits, [sid]: o } }));
  const openChest = (areaId: string) =>
    sid && update((s) => ({ ...s, openedChests: { ...s.openedChests, [sid]: Array.from(new Set([...(s.openedChests?.[sid] ?? []), areaId])) } }));
  return { ctx, outfit, opened, setOutfit, openChest, isStudent: state.session?.role === "elev", currentStudent, tier, p };
}

/** Rad med nycklar för en ö. */
export function KeyRow({ keys, total, size = 18 }: { keys: number; total: number; size?: number }) {
  return (
    <span className="flex flex-wrap items-center gap-0.5" aria-label={`${keys} av ${total} nycklar`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < keys ? "" : "opacity-25 grayscale"}>
          <Icon name="nyckel" size={size} />
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Skattkartan med alla öar                                             */
/* ------------------------------------------------------------------ */

export function TreasureMap() {
  const { ctx, opened } = useTreasure();
  const isl = islands(ctx);
  const cont = continuePoint(ctx.grade, ctx.tier, ctx.p);
  const currentArea = cont?.chapter.areaId;
  const keys = totalKeys(ctx);
  const allKeys = isl.reduce((s, i) => s + i.total, 0);

  return (
    <div className="ocean relative overflow-hidden rounded-[2rem] px-4 py-8 sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-center">
        <span className="flex items-center gap-2 rounded-full bg-paper px-4 py-2 font-bold text-navy shadow-sm">
          <Icon name="nyckel" size={22} /> {keys} / {allKeys} nycklar
        </span>
        <span className="flex items-center gap-2 rounded-full bg-paper px-4 py-2 font-bold text-navy shadow-sm">
          <Icon name="kistaOppen" size={22} /> {opened.length} / {isl.length} kistor
        </span>
      </div>

      <ol className="relative mx-auto max-w-3xl">
        {isl.map((i, idx) => {
          const area = getArea(i.areaId);
          const right = idx % 2 === 1;
          const here = currentArea === i.areaId;
          const isOpen = opened.includes(i.areaId);
          return (
            <li key={i.areaId} className="relative">
              {idx > 0 && (
                <svg className="mx-auto -my-2 block h-14 w-1/2" viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden>
                  <path d={right ? "M10 0 C 10 40, 190 16, 190 56" : "M190 0 C 190 40, 10 16, 10 56"} fill="none" stroke="#0e4f61" strokeOpacity={0.35} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
                </svg>
              )}
              <div className={`flex ${right ? "justify-end" : "justify-start"}`}>
                <Link
                  href={`/aventyret/${i.areaId}`}
                  className={`island-blob island-bob group relative block w-[min(22rem,90%)] p-5 shadow-lg transition-transform hover:scale-[1.02] ${here ? "ring-4 ring-gold" : ""}`}
                  style={{ background: `linear-gradient(160deg, ${area.color}33, #f6e3b4 55%)`, animationDelay: `${idx * 0.4}s` }}
                >
                  {here && (
                    <span className="absolute -top-14 left-4 z-10">
                      <Mascot mood="glad" size={72} />
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-paper shadow-sm">
                      <Icon name={area.icon} size={34} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-navy/60">Ö {idx + 1}</p>
                      <p className="font-serif text-lg font-bold leading-tight text-navy">{area.title}</p>
                    </div>
                    <span className={i.chestReady && !isOpen ? "chest-ready" : ""}>
                      <Icon name={isOpen ? "kistaOppen" : "kista"} size={44} />
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <KeyRow keys={i.keys} total={i.total} />
                    <span className="text-sm font-semibold text-navy">
                      {i.chestReady && !isOpen ? "Öppna kistan!" : isOpen ? "Skatt hittad" : `${i.keys}/${i.total}`}
                    </span>
                  </div>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* En ö: stationer (kapitel) längs en stig och kistan i slutet          */
/* ------------------------------------------------------------------ */

export function IslandView({ areaId }: { areaId: string }) {
  const { ctx, opened, openChest, setOutfit, outfit, isStudent } = useTreasure();
  const [showChest, setShowChest] = useState(false);
  const area = getArea(areaId);
  const isl = islands(ctx).find((i) => i.areaId === areaId)!;
  const chs = chaptersFor(ctx.grade, areaId);
  const firstOpenIdx = chs.findIndex((c) => !chapterDone(ctx, c.id));
  const isOpen = opened.includes(areaId);

  return (
    <div className="ocean relative overflow-hidden rounded-[2rem] px-4 py-8 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/aventyret" className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-navy shadow-sm">
          ← {BRAND.adventureMap}
        </Link>
        <span className="flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-bold text-navy shadow-sm">
          <KeyRow keys={isl.keys} total={isl.total} size={16} />
        </span>
      </div>

      <div className="island-blob mx-auto mt-6 max-w-2xl px-6 py-8 shadow-lg sm:px-10" style={{ background: `linear-gradient(160deg, ${area.color}30, #f6e3b4 50%)` }}>
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-paper shadow-sm">
            <Icon name={area.icon} size={40} />
          </span>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{area.title}</h1>
        </div>

        <ol className="mt-6 space-y-1">
          {chs.map((c, i) => {
            const done = ctx.unlockAll || chapterDone(ctx, c.id);
            const current = !ctx.unlockAll && i === firstOpenIdx;
            const target = c.steps.find((s) => canAccess(ctx.tier, s, c.id) && !ctx.p.completed[s.id]) ?? c.steps[0];
            const offset = ["sm:ml-0", "sm:ml-16", "sm:ml-32", "sm:ml-16"][i % 4];
            return (
              <li key={c.id} className={`relative ${offset}`}>
                <Link href={stepHref(target.id)} className={`flex items-center gap-3 rounded-2xl p-2.5 transition-colors ${current ? "bg-paper shadow-md" : "hover:bg-paper/60"}`}>
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                      done ? "bg-gold shadow" : current ? "bg-paper ring-4 ring-gold" : "border-2 border-dashed border-navy/30 bg-paper/50"
                    }`}
                  >
                    {done ? <Icon name="nyckel" size={28} /> : <span className="font-bold text-navy/60">{i + 1}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-tight text-navy">{c.title}</span>
                    <span className="text-xs text-muted">{done ? "Nyckel hittad!" : current ? "Du är här" : "Station " + (i + 1)}</span>
                  </span>
                  {current && <Mascot mood="pekar" size={56} />}
                </Link>
              </li>
            );
          })}
          {/* kistan */}
          <li className="pt-4 text-center">
            <button
              onClick={() => isl.chestReady && setShowChest(true)}
              disabled={!isl.chestReady}
              className={`mx-auto flex flex-col items-center gap-1 rounded-3xl px-6 py-4 transition-transform ${isl.chestReady ? "hover:scale-105" : "cursor-default opacity-60"}`}
            >
              <span className={isl.chestReady && !isOpen ? "chest-ready" : ""}>
                <Icon name={isOpen ? "kistaOppen" : "kista"} size={84} />
              </span>
              <span className="font-bold text-navy">
                {isOpen ? `Skatt: ${isl.reward?.name}` : isl.chestReady ? (isStudent ? "Öppna kistan!" : "Kistan är redo") : `Hitta ${isl.total - isl.keys} nycklar till`}
              </span>
            </button>
          </li>
        </ol>
      </div>

      {showChest && isl.reward && (
        <ChestModal
          reward={isl.reward}
          outfit={outfit}
          onWear={() => {
            setOutfit({ ...outfit, [isl.reward!.slot]: isl.reward!.id });
          }}
          onClose={() => {
            openChest(areaId);
            setShowChest(false);
          }}
        />
      )}
    </div>
  );
}

/** Kistan öppnas och skatten visas på maskoten. */
export function ChestModal({ reward, outfit, onWear, onClose }: { reward: Accessory; outfit: Outfit; onWear: () => void; onClose: () => void }) {
  const [worn, setWorn] = useState(false);
  const preview: Outfit = { ...outfit, [reward.slot]: reward.id };
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <Confetti />
      <div className="pop-in relative w-full max-w-sm overflow-hidden rounded-3xl bg-paper text-center shadow-2xl">
        <div className="relative grid place-items-center overflow-hidden bg-navy px-6 pb-6 pt-8">
          <div className="rays absolute h-[28rem] w-[28rem]" aria-hidden />
          <span className="chest-open relative">
            <Icon name="kistaOppen" size={110} />
          </span>
        </div>
        <div className="p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-wine">Du hittade en skatt!</p>
          <h2 className="mt-1 text-2xl font-bold">{reward.name}</h2>
          <div className="mt-3 flex justify-center">
            <Mascot mood="dansar" size={120} outfit={preview} />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {!worn ? (
              <button
                className="btn-accent !py-3 text-lg"
                onClick={() => {
                  onWear();
                  setWorn(true);
                }}
              >
                Ta på Sigge!
              </button>
            ) : (
              <p className="font-semibold text-good">Snyggt! Sigge har den på sig nu.</p>
            )}
            <button className="text-sm font-semibold text-navy hover:underline" onClick={onClose}>
              {worn ? "Fortsätt" : "Spara till senare"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Liten skattjaktsruta till elevens startsida. */
export function TreasureTeaser() {
  const { ctx, opened } = useTreasure();
  const cont = continuePoint(ctx.grade, ctx.tier, ctx.p);
  const areaId = cont?.chapter.areaId ?? AREAS[0].id;
  const area = getArea(areaId);
  const isl: IslandState = islands(ctx).find((i) => i.areaId === areaId)!;
  const isOpen = opened.includes(areaId);
  return (
    <Link href={`/aventyret/${areaId}`} className="ocean group relative block overflow-hidden rounded-3xl p-5 shadow-sm ring-1 ring-line transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Icon name="karta" size={28} /> {BRAND.adventure}
        </h2>
        <span className="text-sm font-semibold text-navy group-hover:underline">Till kartan →</span>
      </div>
      <div className="island-blob mt-4 flex items-center gap-4 p-4" style={{ background: `linear-gradient(160deg, ${area.color}33, #f6e3b4 55%)` }}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper">
          <Icon name={area.icon} size={30} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-tight text-navy">{area.title}</p>
          <div className="mt-1">
            <KeyRow keys={isl.keys} total={isl.total} size={16} />
          </div>
        </div>
        <span className={isl.chestReady && !isOpen ? "chest-ready" : ""}>
          <Icon name={isOpen ? "kistaOppen" : "kista"} size={48} />
        </span>
      </div>
      <p className="mt-3 text-sm text-navy">
        {isl.chestReady && !isOpen ? "Kistan är redo att öppnas!" : isOpen ? "Du har hittat skatten här." : `${isl.total - isl.keys} nycklar kvar till skattkistan.`}
      </p>
    </Link>
  );
}
