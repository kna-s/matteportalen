"use client";

import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AREAS, Grade, chaptersFor, getArea } from "@/lib/curriculum";
import { continuePoint, stepHref } from "@/lib/flow";
import { emptyProgress, useStore } from "@/lib/store";
import { canAccess } from "@/lib/tiers";
import { Accessory, IslandState, Outfit, TreasureCtx, chapterDone, foundPieceIds, islands, totalPieces } from "@/lib/treasure";
import { earnedBadges } from "@/lib/badges";
import Icon from "./icons/Icon";
import Mascot from "./Mascot";
import { Confetti } from "./Badges";
import { MapPuzzle, TRAIL_COLOR, TrailPath } from "./MapPuzzle";

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

/** Rad med kartbitar för en ö. */
export function PieceRow({ have, size = 18 }: { have: boolean[]; size?: number }) {
  const found = have.filter(Boolean).length;
  return (
    <span className="flex flex-wrap items-center gap-0.5" aria-label={`${found} av ${have.length} kartbitar`}>
      {have.map((h, i) => (
        <span key={i} className={h ? "" : "opacity-25 grayscale"}>
          <Icon name="kartbit" size={size} />
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
  const pieces = totalPieces(ctx);
  const allPieces = isl.reduce((s, i) => s + i.total, 0);

  return (
    <div className="ocean relative overflow-hidden rounded-[2rem] px-4 py-8 sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-center">
        <span className="flex items-center gap-2 rounded-full bg-paper px-4 py-2 font-bold text-navy shadow-sm">
          <Icon name="kartbit" size={22} /> {pieces} / {allPieces} kartbitar
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
                  <path d={right ? "M10 0 C 10 40, 190 16, 190 56" : "M190 0 C 190 40, 10 16, 10 56"} fill="none" stroke={TRAIL_COLOR} strokeOpacity={0.7} strokeWidth={4} strokeDasharray="10 9" strokeLinecap="round" />
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
                    <PieceRow have={i.have} />
                    <span className="text-sm font-semibold text-navy">
                      {i.chestReady && !isOpen ? "Öppna kistan!" : isOpen ? "Skatt hittad" : `${i.pieces}/${i.total}`}
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
          <Icon name="kartbit" size={18} /> {isl.pieces} / {isl.total} kartbitar
        </span>
      </div>

      <div className="island-blob mx-auto mt-6 max-w-2xl px-6 py-8 shadow-lg sm:px-10" style={{ background: `linear-gradient(160deg, ${area.color}30, #f6e3b4 50%)` }}>
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-paper shadow-sm">
            <Icon name={area.icon} size={40} />
          </span>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{area.title}</h1>
        </div>

        <div className="mx-auto mt-5 max-w-md">
          <MapPuzzle color={area.color} have={isl.have} className="drop-shadow-md" />
          <p className="mt-2 text-center text-sm font-semibold text-navy">
            {isl.chestReady ? "Kartan är hel! Följ den röda linjen till skatten." : `Varje kapitel du klarar ger en kartbit. ${isl.total - isl.pieces} kvar tills kartan är hel.`}
          </p>
        </div>

        <ol className="mt-6 space-y-1">
          {chs.map((c, i) => {
            const done = ctx.unlockAll || chapterDone(ctx, c.id);
            const current = !ctx.unlockAll && i === firstOpenIdx;
            const target = c.steps.find((s) => canAccess(ctx.tier, s, c.id) && !ctx.p.completed[s.id]) ?? c.steps[0];
            return (
              <li key={c.id} className="relative">
                {/* röd streckad stig till nästa station / kistan */}
                <span
                  aria-hidden
                  className="absolute left-[34px] top-1/2 h-full border-l-[4px] border-dashed"
                  style={{ borderColor: done ? TRAIL_COLOR : `${TRAIL_COLOR}55` }}
                />
                <Link href={stepHref(target.id)} className={`relative flex items-center gap-3 rounded-2xl p-2.5 transition-colors ${current ? "bg-paper shadow-md" : "hover:bg-paper/60"}`}>
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                      done ? "bg-gold shadow" : current ? "bg-paper ring-4 ring-gold" : "border-2 border-dashed border-navy/30 bg-paper/50"
                    }`}
                  >
                    {done ? <Icon name="kartbit" size={28} /> : <span className="font-bold text-navy/60">{i + 1}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-tight text-navy">{c.title}</span>
                    <span className="text-xs text-muted">{done ? "Kartbit hittad!" : current ? "Du är här" : "Station " + (i + 1)}</span>
                  </span>
                  {current && <Mascot mood="pekar" size={56} />}
                </Link>
              </li>
            );
          })}
          {/* kistan */}
          <li className="pt-1">
            <button
              onClick={() => isl.chestReady && setShowChest(true)}
              disabled={!isl.chestReady}
              className={`flex items-center gap-3 rounded-3xl p-1 text-left transition-transform ${isl.chestReady ? "hover:scale-105" : "cursor-default"}`}
            >
              <span className={`${isl.chestReady && !isOpen ? "chest-ready" : isl.chestReady ? "" : "opacity-60"}`}>
                <Icon name={isOpen ? "kistaOppen" : "kista"} size={68} />
              </span>
              <span className="font-bold text-navy">
                {isOpen ? `Skatt: ${isl.reward?.name}` : isl.chestReady ? (isStudent ? "Öppna kistan!" : "Kistan är redo") : `Hitta ${isl.total - isl.pieces} kartbitar till`}
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

/** Stigen till kistan för ön eleven är på, som remsa i startsidans stora kort. */
export function TreasureTrailStrip() {
  const { ctx, opened } = useTreasure();
  const cont = continuePoint(ctx.grade, ctx.tier, ctx.p);
  const areaId = cont?.chapter.areaId ?? AREAS[0].id;
  const area = getArea(areaId);
  const isl: IslandState = islands(ctx).find((i) => i.areaId === areaId)!;
  const isOpen = opened.includes(areaId);
  const chs = chaptersFor(ctx.grade, areaId);
  const left = isl.total - isl.pieces;
  return (
    <div className="ocean px-4 pb-4 pt-3 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-navy">
          <Icon name={area.icon} size={22} className="shrink-0" />
          <span className="truncate">Ön {area.title}</span>
        </p>
        <Link href={`/aventyret/${areaId}`} className="shrink-0 text-sm font-semibold text-navy hover:underline">
          Till kartan →
        </Link>
      </div>
      <div className="mt-6">
        <TrailPath
          stations={chs.map((c, i) => ({ title: c.title, done: isl.have[i], href: `/aventyret/${areaId}` }))}
          chestReady={isl.chestReady}
          chestOpen={isOpen}
          chestHref={`/aventyret/${areaId}`}
        />
      </div>
      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-navy">
        <Icon name="kartbit" size={20} />
        {isl.chestReady && !isOpen
          ? "Kartan är hel! Kistan är redo att öppnas."
          : isOpen
            ? "Du har hittat skatten här."
            : `${left} ${left === 1 ? "kartbit" : "kartbitar"} kvar till skattkistan.`}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notis när eleven hittar en ny kartbit                                */
/* ------------------------------------------------------------------ */

export function MapPieceWatcher() {
  const { state, update, tier, currentStudent } = useStore();
  const isStudent = state.session?.role === "elev";
  const sid = currentStudent?.id;
  const p = (sid && state.progress[sid]) || emptyProgress();
  const grade = (currentStudent?.grade ?? 4) as Grade;
  const ctx: TreasureCtx = useMemo(() => ({ p, grade, tier }), [p, grade, tier]);
  const found = useMemo(() => (sid ? foundPieceIds(ctx) : []), [ctx, sid]);
  const seen = sid ? state.seenPieces?.[sid] : undefined;

  // Första gången: räkna redan hittade bitar som sedda, utan animation.
  useEffect(() => {
    if (!sid || seen) return;
    update((s) => ({ ...s, seenPieces: { ...s.seenPieces, [sid]: found } }));
  }, [sid, seen, found, update]);

  // Märkesnotisen visas först, kartbiten sen.
  const badgeSeen = sid ? state.seenBadges[sid] : undefined;
  const badgeWaiting = !!state.demoBadge || (isStudent && !!badgeSeen && earnedBadges(ctx).some((b) => !badgeSeen[b.id]));

  let show: { areaId: string; have: boolean[]; fresh: number; chapterId?: string } | null = null;
  if (state.demoPiece) {
    const [areaId, mode] = state.demoPiece.split(":");
    const isl = islands(ctx).find((i) => i.areaId === areaId);
    if (isl) {
      const have = mode === "hel" ? isl.have.map(() => true) : [...isl.have];
      let fresh = have.findIndex((h) => !h);
      if (fresh === -1) fresh = have.length - 1;
      have[fresh] = true;
      show = { areaId, have, fresh };
    }
  } else if (isStudent && seen && !badgeWaiting) {
    const id = found.find((c) => !seen.includes(c));
    const ch = id ? chaptersFor(grade).find((c) => c.id === id) : undefined;
    if (ch) {
      const isl = islands(ctx).find((i) => i.areaId === ch.areaId)!;
      const fresh = chaptersFor(grade, ch.areaId).findIndex((c) => c.id === ch.id);
      show = { areaId: ch.areaId, have: isl.have, fresh, chapterId: ch.id };
    }
  }
  if (!show) return null;
  const s0 = show;

  return (
    <MapPieceModal
      key={`${s0.areaId}-${s0.fresh}-${state.demoPiece ?? ""}`}
      areaId={s0.areaId}
      have={s0.have}
      fresh={s0.fresh}
      onClose={() =>
        update((s) => {
          if (s.demoPiece) return { ...s, demoPiece: null };
          return { ...s, seenPieces: { ...s.seenPieces, [sid!]: Array.from(new Set([...(s.seenPieces?.[sid!] ?? []), s0.chapterId!])) } };
        })
      }
    />
  );
}

function MapPieceModal({ areaId, have, fresh, onClose }: { areaId: string; have: boolean[]; fresh: number; onClose: () => void }) {
  const area = getArea(areaId);
  const complete = have.every(Boolean);
  const left = have.filter((h) => !h).length;
  const [phase, setPhase] = useState<"bit" | "hel">("bit");
  useEffect(() => {
    if (!complete) return;
    const t = setTimeout(() => setPhase("hel"), 1500);
    return () => clearTimeout(t);
  }, [complete]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Ny kartbit">
      {phase === "hel" && <Confetti />}
      <div className="pop-in relative w-full max-w-md overflow-hidden rounded-3xl bg-paper text-center shadow-2xl">
        <div className="relative overflow-hidden bg-navy px-5 pb-5 pt-6">
          {phase === "hel" && <div className="rays absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2" aria-hidden />}
          <p className="relative text-sm font-bold uppercase tracking-[0.2em] text-gold">{phase === "hel" ? "Kartan är hel!" : "Du hittade en kartbit!"}</p>
          <div className="relative mt-3">
            <MapPuzzle key={phase} color={area.color} have={have} fresh={phase === "bit" ? fresh : undefined} celebrate={phase === "hel"} className="drop-shadow-xl" />
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Mascot mood={phase === "hel" ? "dansar" : "hurra"} size={72} />
            <p className="text-left font-semibold text-navy">
              {phase === "hel"
                ? `Följ den röda linjen! Skattkistan på ön ${area.title} väntar på dig.`
                : complete
                  ? "Sista biten! Titta vad som händer…"
                  : `Ön ${area.title}: ${left} ${left === 1 ? "bit" : "bitar"} kvar tills kartan är hel.`}
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            {phase === "hel" ? (
              <Link href={`/aventyret/${areaId}`} onClick={onClose} className="btn-accent !py-3 text-lg">
                Till skattkistan →
              </Link>
            ) : (
              <button className="btn-accent !py-3 text-lg" onClick={onClose} disabled={complete}>
                {complete ? "…" : "Snyggt!"}
              </button>
            )}
            {phase === "hel" && (
              <button className="text-sm font-semibold text-navy hover:underline" onClick={onClose}>
                Senare
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
