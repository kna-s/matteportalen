"use client";

// Skattkartan som pusslas ihop av kartbitar (ett kapitel = en bit), och den
// röda streckade stigen som visar hur långt eleven har kvar till kistan.

import Link from "next/link";
import { useId } from "react";
import Icon from "./icons/Icon";
import Mascot from "./Mascot";

export const TRAIL_COLOR = "#d8463c";

const W = 400;
const H = 260;
const TRAIL = "M62 212 C 100 200, 112 168, 150 170 S 214 208, 252 182 S 276 118, 312 100";
const X = { x: 318, y: 92 };

/** Delar kartan i n rektanglar: en rad upp till 3 bitar, annars två rader. */
function pieceRects(n: number) {
  const rows = n <= 3 ? 1 : 2;
  const top = Math.ceil(n / rows);
  const out: { x: number; y: number; w: number; h: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const cols = r === 0 ? top : n - top;
    const w = W / cols;
    for (let c = 0; c < cols; c++) out.push({ x: c * w, y: (r * H) / rows, w, h: H / rows });
  }
  return out;
}

/** Själva kartbilden: ö, palmer, berg, kompass och stigen till X. */
function MapArt({ color }: { color: string }) {
  const ink = "#8a6a3a";
  return (
    <>
      <rect width={W} height={H} fill="#f4e4bc" />
      <circle cx={70} cy={50} r={40} fill="#e8d3a2" opacity={0.5} />
      <circle cx={350} cy={230} r={50} fill="#e8d3a2" opacity={0.5} />
      {/* vågor */}
      {[
        [28, 40],
        [36, 128],
        [24, 238],
        [366, 34],
        [374, 150],
        [200, 22],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q6 -6 12 0 t12 0`} stroke="#5aa6b5" strokeWidth={2} fill="none" strokeLinecap="round" />
      ))}
      {/* ön */}
      <path
        d="M58 214 C 26 168, 52 92, 124 76 C 170 38, 264 40, 318 58 C 374 82, 382 160, 344 204 C 304 244, 210 240, 156 230 C 112 236, 76 236, 58 214 Z"
        fill="#ead39b"
        stroke={ink}
        strokeWidth={3}
      />
      <path
        d="M80 204 C 60 168, 78 108, 134 96 C 176 62, 258 62, 306 78 C 352 98, 356 160, 328 192 C 294 224, 214 220, 164 212 C 126 218, 94 220, 80 204 Z"
        fill={color}
        fillOpacity={0.3}
      />
      {/* sjö */}
      <ellipse cx={226} cy={120} rx={26} ry={14} fill="#9fd3dc" stroke={ink} strokeWidth={2} />
      {/* berg */}
      <path d="M150 128 l20 -34 l20 34z" fill="#cdb78b" stroke={ink} strokeWidth={2} strokeLinejoin="round" />
      <path d="M176 128 l16 -26 l16 26z" fill="#bfa877" stroke={ink} strokeWidth={2} strokeLinejoin="round" />
      <path d="M164 102 l6 -8 l6 8" fill="#fff" />
      {/* palmer */}
      {[
        [106, 150],
        [284, 196],
        [296, 128],
      ].map(([x, y], i) => (
        <g key={i} stroke={ink} strokeWidth={2} strokeLinecap="round" fill="none">
          <path d={`M${x} ${y + 22} q-2 -12 2 -22`} />
          <path d={`M${x + 2} ${y} q-12 -6 -18 2 M${x + 2} ${y} q12 -6 18 2 M${x + 2} ${y} q-4 -12 -14 -12 M${x + 2} ${y} q6 -12 14 -10`} stroke="#3c8a5b" strokeWidth={3} />
        </g>
      ))}
      {/* kompass */}
      <g transform="translate(362 210)">
        <circle r={18} fill="#f8ecd0" stroke={ink} strokeWidth={2} />
        <path d="M0 -14 L4 0 L0 14 L-4 0 Z" fill={ink} />
        <path d="M0 -14 L4 0 L-4 0 Z" fill={TRAIL_COLOR} />
        <text y={-22} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
          N
        </text>
      </g>
      {/* stigen */}
      <circle cx={62} cy={212} r={5} fill={TRAIL_COLOR} />
      <path d={TRAIL} stroke={TRAIL_COLOR} strokeWidth={3.5} strokeDasharray="8 8" strokeLinecap="round" fill="none" />
      <path d={`M${X.x - 9} ${X.y - 9} l18 18 M${X.x + 9} ${X.y - 9} l-18 18`} stroke={TRAIL_COLOR} strokeWidth={5} strokeLinecap="round" />
    </>
  );
}

/**
 * Kartan i bitar. `have` säger vilka bitar som är hittade (i kapitelordning).
 * `fresh` är biten som flyger in just nu, `celebrate` spelar animationen när kartan blir hel.
 */
export function MapPuzzle({
  color,
  have,
  fresh,
  celebrate = false,
  className = "",
}: {
  color: string;
  have: boolean[];
  fresh?: number;
  celebrate?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rects = pieceRects(have.length);
  const complete = have.length > 0 && have.every(Boolean);
  const found = have.filter(Boolean).length;
  const art = `art-${uid}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block h-auto w-full ${className}`} role="img" aria-label={complete ? "Hel skattkarta" : `${found} av ${have.length} kartbitar hittade`}>
      <defs>
        <g id={art}>
          <MapArt color={color} />
        </g>
        {rects.map((r, i) => (
          <clipPath key={i} id={`clip-${uid}-${i}`}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} />
          </clipPath>
        ))}
        <mask id={`draw-${uid}`}>
          <path d={TRAIL} stroke="#fff" strokeWidth={16} fill="none" strokeLinecap="round" pathLength={1} className="trail-draw" />
        </mask>
        <clipPath id={`round-${uid}`}>
          <rect width={W} height={H} rx={16} />
        </clipPath>
      </defs>

      <g clipPath={`url(#round-${uid})`}>
        {/* tomma platser */}
        <rect width={W} height={H} fill="#efe6d2" />
        {rects.map((r, i) =>
          have[i] && i !== fresh ? null : (
            <g key={`empty-${i}`}>
              <rect x={r.x + 5} y={r.y + 5} width={r.w - 10} height={r.h - 10} rx={10} fill="#e4d8bd" stroke="#b9a57f" strokeWidth={2} strokeDasharray="7 6" />
              <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 12} textAnchor="middle" fontSize={34} fontWeight={700} fill="#b9a57f">
                ?
              </text>
            </g>
          ),
        )}

        {/* hittade bitar */}
        {rects.map((r, i) =>
          have[i] ? (
            <g key={`piece-${i}`} className={i === fresh ? "piece-fly" : undefined}>
              <use href={`#${art}`} clipPath={`url(#clip-${uid}-${i})`} />
              {i === fresh && <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#fff6d6" className="piece-glow" style={{ mixBlendMode: "soft-light" }} />}
            </g>
          ) : null,
        )}

        {/* hel karta utan skarvar under bitarna (syns när skarvarna tonar bort) */}
        {complete && <use href={`#${art}`} className={celebrate ? "seam-fade-in" : undefined} />}

        {/* skarvar mellan bitarna */}
        {(!complete || celebrate) && (
          <g className={complete && celebrate ? "seam-fade" : undefined}>
            {rects.map((r, i) =>
              have[i] ? <rect key={i} x={r.x + 1} y={r.y + 1} width={r.w - 2} height={r.h - 2} fill="none" stroke="#8a6a3a" strokeOpacity={0.3} strokeWidth={1.5} /> : null,
            )}
          </g>
        )}

        {/* hel karta: stigen ritas tydligt och kistan dyker upp vid X */}
        {complete && (
          <>
            <path
              d={TRAIL}
              stroke={TRAIL_COLOR}
              strokeWidth={6}
              strokeDasharray="12 10"
              strokeLinecap="round"
              fill="none"
              mask={celebrate ? `url(#draw-${uid})` : undefined}
            />
            <g transform={`translate(${X.x - 26} ${X.y - 58})`}>
              <g className={celebrate ? "x-pop" : undefined}>
                <Icon name="kista" size={52} />
              </g>
            </g>
          </>
        )}
      </g>
      <rect width={W} height={H} rx={16} fill="none" stroke="#8a6a3a" strokeWidth={3} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Röd streckad stig till kistan                                       */
/* ------------------------------------------------------------------ */

export interface TrailStation {
  title: string;
  done: boolean;
  href?: string;
}

/**
 * En slingrande röd streckad linje med en station per kapitel och kistan i
 * slutet. Sigge står vid stationen eleven är på.
 */
export function TrailPath({
  stations,
  chestReady,
  chestOpen,
  chestHref,
  showMascot = true,
}: {
  stations: TrailStation[];
  chestReady: boolean;
  chestOpen: boolean;
  chestHref?: string;
  showMascot?: boolean;
}) {
  const VW = 600;
  const VH = 130;
  const n = stations.length;
  const pts = stations.map((_, i) => ({ x: 36 + (i * 470) / Math.max(1, n), y: i % 2 ? 46 : 92 }));
  const chest = { x: 560, y: n % 2 ? 46 : 92 };
  const all = [...pts, chest];
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2;
    return ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  };
  const pathTo = (k: number) => all.slice(1, k + 1).reduce((d, p, i) => d + seg(all[i], p), `M ${all[0].x} ${all[0].y}`);
  const current = stations.findIndex((s) => !s.done);
  const reached = current === -1 ? all.length - 1 : current;
  const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` });

  const Station = ({ s, i }: { s: TrailStation; i: number }) => {
    const inner = s.done ? (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-paper shadow ring-2 ring-gold sm:h-9 sm:w-9">
        <Icon name="kartbit" size={20} />
      </span>
    ) : (
      <span
        className={`grid h-7 w-7 place-items-center sm:h-8 sm:w-8 rounded-full text-xs font-bold ${i === current ? `bg-paper text-navy shadow ring-4 ring-gold ${showMascot ? "" : "here-pulse"}` : "border-2 border-dashed border-navy/30 bg-paper/70 text-navy/50"}`}
      >
        {i + 1}
      </span>
    );
    return s.href ? (
      <Link href={s.href} title={s.title} aria-label={s.title} className="transition-transform hover:scale-110">
        {inner}
      </Link>
    ) : (
      <span title={s.title}>{inner}</span>
    );
  };

  return (
    // På mobil blir rutan högre så att stationerna inte krockar; linjen töjs med.
    <div className="relative aspect-[600/300] w-full sm:aspect-[600/130]">
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path d={pathTo(all.length - 1)} stroke={TRAIL_COLOR} strokeOpacity={0.28} strokeWidth={4} strokeDasharray="10 9" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />
        {reached > 0 && <path d={pathTo(reached)} stroke={TRAIL_COLOR} strokeWidth={5} strokeDasharray="10 9" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" className="trail-march" />}
      </svg>
      {stations.map((s, i) => (
        <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(pts[i])}>
          <Station s={s} i={i} />
          {showMascot && i === current && (
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2">
              <Mascot mood="glad" size={44} />
            </span>
          )}
        </span>
      ))}
      <span className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(chest)}>
        {chestHref ? (
          <Link href={chestHref} aria-label="Skattkistan" className={`block ${chestReady && !chestOpen ? "chest-ready" : ""}`}>
            <Icon name={chestOpen ? "kistaOppen" : "kista"} size={52} />
          </Link>
        ) : (
          <span className={chestReady && !chestOpen ? "chest-ready" : ""}>
            <Icon name={chestOpen ? "kistaOppen" : "kista"} size={52} />
          </span>
        )}
        {showMascot && current === -1 && !chestOpen && (
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2">
            <Mascot mood="hurra" size={44} />
          </span>
        )}
      </span>
    </div>
  );
}
