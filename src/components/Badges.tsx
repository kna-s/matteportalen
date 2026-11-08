"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { BADGES, Badge, CATEGORY_INFO, earnedBadges, getBadge } from "@/lib/badges";
import { emptyProgress, useStore } from "@/lib/store";
import Mascot from "./Mascot";

/** Medaljong för ett märke. */
export function BadgeMedal({ badge, earned, size = 72, progress }: { badge: Badge; earned: boolean; size?: number; progress?: number }) {
  const color = CATEGORY_INFO[badge.category].color;
  const id = `g-${badge.id}-${earned ? 1 : 0}`;
  const r = 30;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 80 92" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={earned ? "#ffe9a8" : "#e6e6e6"} />
          <stop offset="0.5" stopColor={earned ? "#f5c542" : "#cfcfcf"} />
          <stop offset="1" stopColor={earned ? "#d79a14" : "#b5b5b5"} />
        </linearGradient>
      </defs>
      {/* band */}
      <path d="M24 60 L16 90 L28 84 L34 92 L40 64 Z" fill={earned ? color : "#cfcfcf"} opacity={earned ? 1 : 0.7} />
      <path d="M56 60 L64 90 L52 84 L46 92 L40 64 Z" fill={earned ? color : "#cfcfcf"} opacity={earned ? 0.85 : 0.6} />
      {/* yttre ring */}
      <circle cx={40} cy={40} r={36} fill={`url(#${id})`} />
      {/* tandad kant */}
      <circle cx={40} cy={40} r={33} fill="none" stroke={earned ? "#fff3cc" : "#eee"} strokeWidth={1.5} strokeDasharray="2 3" />
      {/* inre */}
      <circle cx={40} cy={40} r={28} fill={earned ? color : "#d9d9d9"} />
      {!earned && progress !== undefined && progress > 0 && (
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${circ * progress} ${circ}`}
          transform="rotate(-90 40 40)"
        />
      )}
      <text x={40} y={49} textAnchor="middle" fontSize={26} style={{ filter: earned ? "none" : "grayscale(1)", opacity: earned ? 1 : 0.35 }}>
        {badge.icon}
      </text>
      {!earned && (
        <g>
          <circle cx={62} cy={62} r={9} fill="#fff" stroke="#cfcfcf" />
          <text x={62} y={66} textAnchor="middle" fontSize={10}>
            🔒
          </text>
        </g>
      )}
      {earned && <path d="M18 22 Q24 12 34 9" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />}
    </svg>
  );
}

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: ((i * 13) % 20) / 20,
        dur: 1.8 + ((i * 7) % 10) / 10,
        color: ["var(--color-gold)", "var(--color-wine)", "var(--color-navy)", "#8fd3b6", "#ffffff"][i % 5],
        rot: (i * 47) % 360,
        w: 6 + (i % 3) * 3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, width: p.w, transform: `rotate(${p.rot}deg)` }}
        />
      ))}
    </div>
  );
}

/** Notis i mitten av skärmen när man låser upp ett märke. */
export function BadgeCelebration({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="badge-title">
      <Confetti />
      <div className="pop-in relative w-full max-w-sm overflow-hidden rounded-3xl bg-paper text-center shadow-2xl">
        <div className="relative bg-navy px-6 pb-14 pt-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Nytt märke!</p>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="medal-spin">
              <BadgeMedal badge={badge} earned size={96} />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-16">
          <h2 id="badge-title" className="text-2xl font-bold">
            {badge.name}
          </h2>
          <p className="mt-1 text-muted">{badge.description}</p>
          <div className="mt-4 flex items-end justify-center gap-2">
            <Mascot mood="hurra" size={76} />
            <p className="mb-2 rounded-2xl rounded-bl-sm bg-gold-light px-3 py-2 text-sm font-semibold text-gold-ink">{badge.cheer}</p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={onClose} className="btn-accent !py-3 text-lg" autoFocus>
              Snyggt!
            </button>
            <Link href="/marken" onClick={onClose} className="text-sm font-semibold text-navy hover:underline">
              Se alla mina märken
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Detaljkort när man klickar på ett märke. */
export function BadgeDetail({ badge, earnedAt, earned, progress, onClose }: { badge: Badge; earned: boolean; earnedAt?: string; progress?: number; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="pop-in relative w-full max-w-md rounded-3xl bg-paper p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-3 text-xl text-muted hover:text-ink" aria-label="Stäng">
          ✕
        </button>
        <div className="flex justify-center">
          <BadgeMedal badge={badge} earned={earned} size={104} progress={progress} />
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider" style={{ color: CATEGORY_INFO[badge.category].color }}>
          {CATEGORY_INFO[badge.category].title}
        </p>
        <h2 className="text-2xl font-bold">{badge.name}</h2>
        {earned ? (
          <>
            <p className="mt-1 text-muted">{badge.description}</p>
            {earnedAt && <p className="mt-1 text-xs text-muted">Upplåst {new Date(earnedAt).toLocaleDateString("sv-SE", { day: "numeric", month: "long" })}</p>}
          </>
        ) : (
          <>
            <p className="mt-1 text-muted">
              <b className="text-navy">Så låser du upp det:</b> {badge.hint}
            </p>
            {progress !== undefined && progress > 0 && (
              <div className="mx-auto mt-3 max-w-xs">
                <div className="h-2.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-wine" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted">{Math.round(progress * 100)} % på väg</p>
              </div>
            )}
          </>
        )}
        <div className="mt-5 rounded-2xl bg-gold-light/60 p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-ink"><Icon name="problemlosning" size={16} className="mr-1 inline-block align-[-3px]" /> Visste du att…</p>
          <p className="mt-1 text-sm">{badge.funFact}</p>
        </div>
        {earned && (
          <div className="mt-4 flex items-end justify-center gap-2">
            <Mascot mood="glad" size={48} />
            <p className="mb-2 rounded-2xl rounded-bl-sm bg-cream px-3 py-2 text-sm font-medium">{badge.cheer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Håller koll på nya märken och visar notisen. Visar även demo-notiser. */
export function BadgeWatcher() {
  const { state, update, tier, currentStudent } = useStore();
  const isStudent = state.session?.role === "elev";
  const sid = currentStudent?.id;
  const p = (sid && state.progress[sid]) || emptyProgress();
  const earnedIds = useMemo(
    () => (currentStudent ? earnedBadges({ p, grade: currentStudent.grade, tier }).map((b) => b.id) : []),
    [p, currentStudent, tier],
  );
  const seen = sid ? state.seenBadges[sid] : undefined;

  // Första gången: markera redan upplåsta märken som sedda utan notis.
  useEffect(() => {
    if (!sid || seen) return;
    const now = new Date().toISOString();
    update((s) => ({ ...s, seenBadges: { ...s.seenBadges, [sid]: Object.fromEntries(earnedIds.map((id) => [id, now])) } }));
  }, [sid, seen, earnedIds, update]);

  const demo = state.demoBadge ? getBadge(state.demoBadge) : undefined;
  const fresh = isStudent && seen ? earnedIds.find((id) => !seen[id]) : undefined;
  const show = demo ?? (fresh ? getBadge(fresh) : undefined);
  if (!show) return null;

  return (
    <BadgeCelebration
      key={show.id}
      badge={show}
      onClose={() =>
        update((s) => {
          if (demo) return { ...s, demoBadge: null };
          return { ...s, seenBadges: { ...s.seenBadges, [sid!]: { ...(s.seenBadges[sid!] ?? {}), [show.id]: new Date().toISOString() } } };
        })
      }
    />
  );
}

export { BADGES };
