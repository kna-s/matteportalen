"use client";

/**
 * FÖRHANDSVISNING: olika kroppar för Sigge sköldpadda.
 * När en variant är vald flyttas den in i Mascot.tsx.
 */
import { Cheeks, Face, Mood } from "./Mascot";

const NAVY = "var(--color-navy)";
const NAVY_L = "var(--color-navy-light)";
const ACCENT = "var(--color-wine)";
const GOLD = "var(--color-gold)";
const GOLD_L = "var(--color-gold-light)";
const MINT = "#8fd3b6";
const MINT_L = "#b9e6d3";
const MINT_D = "#5fb894";

function Scarf({ cx, y, w = 18 }: { cx: number; y: number; w?: number }) {
  return (
    <>
      <path d={`M${cx - w} ${y} Q${cx} ${y + 7} ${cx + w} ${y} L${cx + w - 2} ${y + 6} Q${cx} ${y + 13} ${cx - w + 2} ${y + 6} Z`} style={{ fill: ACCENT }} />
      <path d={`M${cx + w - 8} ${y + 5} l5 10 l-7 -1 Z`} style={{ fill: ACCENT }} />
    </>
  );
}

/* B – Stående, med synlig mage (klassisk tecknad sköldpadda) */
export function SiggeStaende({ mood }: { mood: Mood }) {
  return (
    <g>
      {/* skal bakom kroppen */}
      <ellipse cx={50} cy={70} rx={27} ry={24} style={{ fill: NAVY, stroke: GOLD }} strokeWidth={2.5} />
      <path d="M25 62 l4 -5 h4 M75 62 l-4 -5 h-4 M24 78 h5 l3 4 M76 78 h-5 l-3 4" style={{ stroke: NAVY_L }} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      {/* fötter */}
      <ellipse cx={39} cy={93} rx={8} ry={5} fill={MINT_D} />
      <ellipse cx={61} cy={93} rx={8} ry={5} fill={MINT_D} />
      {/* armar */}
      {mood === "hurra" ? (
        <>
          <path d="M31 60 Q20 50 18 38" stroke={MINT_D} strokeWidth={7} strokeLinecap="round" fill="none" />
          <path d="M69 60 Q80 50 82 38" stroke={MINT_D} strokeWidth={7} strokeLinecap="round" fill="none" />
        </>
      ) : mood === "tanker" ? (
        <>
          <path d="M31 62 Q24 70 25 80" stroke={MINT_D} strokeWidth={7} strokeLinecap="round" fill="none" />
          <path d="M69 64 Q74 56 64 50" stroke={MINT_D} strokeWidth={7} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <path d="M31 62 Q24 70 25 80" stroke={MINT_D} strokeWidth={7} strokeLinecap="round" fill="none" />
          <path d="M69 62 Q76 70 75 80" stroke={MINT_D} strokeWidth={7} strokeLinecap="round" fill="none" />
        </>
      )}
      {/* mage */}
      <rect x={34} y={52} width={32} height={38} rx={15} style={{ fill: GOLD_L, stroke: GOLD }} strokeWidth={2} />
      <path d="M36 65 H64 M36 77 H64 M50 54 V88" style={{ stroke: GOLD }} strokeWidth={1.6} />
      {/* huvud */}
      <circle cx={50} cy={31} r={21} fill={MINT} />
      <ellipse cx={50} cy={40} rx={11} ry={6.5} fill={MINT_L} />
      <Scarf cx={50} y={49} w={16} />
      <Face cx={50} cy={28} mood={mood} gap={8} eye={3.8} />
      <Cheeks cx={50} cy={37} gap={14} />
    </g>
  );
}

/* C – Sidovy, kryper framåt (klassisk sköldpaddsform) */
export function SiggeSida({ mood }: { mood: Mood }) {
  const frontUp = mood === "hurra";
  return (
    <g>
      {/* svans */}
      <path d="M10 72 L3 77 L11 77 Z" fill={MINT_D} />
      {/* bakre ben */}
      <rect x={15} y={68} width={11} height={20} rx={5} fill={MINT_D} />
      <rect x={31} y={70} width={11} height={18} rx={5} fill={MINT_D} />
      {/* främre ben */}
      {frontUp ? (
        <rect x={62} y={50} width={11} height={22} rx={5} fill={MINT_D} transform="rotate(-35 67 70)" />
      ) : (
        <rect x={58} y={68} width={11} height={20} rx={5} fill={MINT_D} />
      )}
      <rect x={44} y={70} width={11} height={18} rx={5} fill={MINT_D} />
      {/* skal */}
      <path d="M8 74 Q10 34 42 32 Q70 32 74 74 Z" style={{ fill: NAVY }} />
      <path d="M30 50 l6 -7 h10 l6 7 l-6 7 h-10 Z M14 62 l4 -6 h8 l4 6 l-4 6 h-8 Z M50 62 l4 -6 h8 l4 6 l-4 6 h-8 Z" style={{ fill: NAVY_L }} />
      <path d="M7 74 H75" style={{ stroke: GOLD }} strokeWidth={5} strokeLinecap="round" />
      {/* hals och huvud */}
      <path d="M68 66 Q74 56 80 50" stroke={MINT} strokeWidth={12} strokeLinecap="round" fill="none" />
      <circle cx={82} cy={42} r={15} fill={MINT} />
      <ellipse cx={86} cy={49} rx={8} ry={4.5} fill={MINT_L} />
      <path d="M68 58 Q76 64 86 56 L85 61 Q76 69 67 63 Z" style={{ fill: ACCENT }} />
      {mood === "tanker" && <path d="M74 66 Q84 62 88 56" stroke={MINT_D} strokeWidth={6} strokeLinecap="round" fill="none" />}
      <Face cx={84} cy={39} mood={mood} gap={5.5} eye={3.2} />
      <ellipse cx={93} cy={47} rx={3} ry={2} style={{ fill: ACCENT }} opacity={0.4} />
    </g>
  );
}

/* D – Tittar ut ur skalet (rund och mjuk) */
export function SiggeSkal({ mood }: { mood: Mood }) {
  const handsUp = mood === "hurra";
  return (
    <g>
      {/* fötter */}
      <ellipse cx={33} cy={93} rx={9} ry={5.5} fill={MINT_D} />
      <ellipse cx={67} cy={93} rx={9} ry={5.5} fill={MINT_D} />
      {/* skal */}
      <circle cx={50} cy={56} r={38} style={{ fill: NAVY, stroke: GOLD }} strokeWidth={3} />
      <path d="M22 40 l5 -6 h7 l4 6 l-4 6 h-7 Z M66 40 l4 -6 h7 l5 6 l-5 6 h-7 Z M18 66 l4 -6 h7 l4 6 l-4 6 h-7 Z M71 66 l4 -6 h7 l4 6 l-4 6 h-7 Z M40 82 l4 -5 h12 l4 5 l-4 5 h-12 Z" style={{ fill: NAVY_L }} />
      {/* öppning */}
      <ellipse cx={50} cy={52} rx={25} ry={23} fill="#0b2f39" opacity={0.55} />
      {/* huvud */}
      <circle cx={50} cy={50} r={20} fill={MINT} />
      <ellipse cx={50} cy={58} rx={10} ry={6} fill={MINT_L} />
      <Face cx={50} cy={47} mood={mood} gap={7.5} eye={3.6} />
      <Cheeks cx={50} cy={55} gap={13} />
      {/* händer */}
      {handsUp ? (
        <>
          <circle cx={20} cy={26} r={6} fill={MINT_D} />
          <circle cx={80} cy={26} r={6} fill={MINT_D} />
        </>
      ) : mood === "tanker" ? (
        <>
          <circle cx={29} cy={66} r={6} fill={MINT_D} />
          <circle cx={60} cy={64} r={6} fill={MINT_D} />
        </>
      ) : (
        <>
          <circle cx={29} cy={66} r={6} fill={MINT_D} />
          <circle cx={71} cy={66} r={6} fill={MINT_D} />
        </>
      )}
      {/* rosett */}
      <path d="M44 16 L50 20 L44 24 Z M56 16 L50 20 L56 24 Z" style={{ fill: ACCENT }} />
      <circle cx={50} cy={20} r={2.5} style={{ fill: ACCENT }} />
    </g>
  );
}
