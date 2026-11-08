"use client";

/**
 * "Pi" – sajtens maskot. En enkel, rund figur med ett π på huvudet.
 * Används sparsamt i elevvyn: hälsning, firande och uppmuntran.
 */
export type Mood = "glad" | "hurra" | "tanker";

export default function Mascot({ mood = "glad", size = 72, className = "" }: { mood?: Mood; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="Pi, Matteportalens maskot">
      {/* armar */}
      {mood === "hurra" ? (
        <>
          <path d="M22 58 L8 34" stroke="var(--color-navy)" strokeWidth={6} strokeLinecap="round" />
          <path d="M78 58 L92 34" stroke="var(--color-navy)" strokeWidth={6} strokeLinecap="round" />
        </>
      ) : mood === "tanker" ? (
        <>
          <path d="M22 66 L12 76" stroke="var(--color-navy)" strokeWidth={6} strokeLinecap="round" />
          <path d="M78 64 L66 52" stroke="var(--color-navy)" strokeWidth={6} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M22 66 L12 76" stroke="var(--color-navy)" strokeWidth={6} strokeLinecap="round" />
          <path d="M78 66 L88 76" stroke="var(--color-navy)" strokeWidth={6} strokeLinecap="round" />
        </>
      )}
      {/* kropp */}
      <rect x={20} y={28} width={60} height={62} rx={28} style={{ fill: "var(--color-gold)" }} />
      <ellipse cx={50} cy={74} rx={18} ry={12} style={{ fill: "var(--color-gold-light)" }} />
      {/* π på huvudet */}
      <path d="M34 18 H66 M42 18 V30 M58 18 V30" stroke="var(--color-navy)" strokeWidth={5} strokeLinecap="round" fill="none" />
      {/* ögon */}
      {mood === "hurra" ? (
        <>
          <path d="M36 50 Q40 44 44 50" stroke="var(--color-navy)" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M56 50 Q60 44 64 50" stroke="var(--color-navy)" strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={40} cy={49} r={5} style={{ fill: "var(--color-navy)" }} />
          <circle cx={60} cy={49} r={5} style={{ fill: "var(--color-navy)" }} />
          <circle cx={41.5} cy={47.5} r={1.6} fill="#fff" />
          <circle cx={61.5} cy={47.5} r={1.6} fill="#fff" />
        </>
      )}
      {/* kinder */}
      <circle cx={32} cy={58} r={4} style={{ fill: "var(--color-wine)" }} opacity={0.35} />
      <circle cx={68} cy={58} r={4} style={{ fill: "var(--color-wine)" }} opacity={0.35} />
      {/* mun */}
      {mood === "tanker" ? (
        <path d="M44 62 H56" stroke="var(--color-navy)" strokeWidth={4} strokeLinecap="round" />
      ) : (
        <path d={mood === "hurra" ? "M40 58 Q50 70 60 58" : "M42 59 Q50 66 58 59"} stroke="var(--color-navy)" strokeWidth={4} fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

/** Pi med en pratbubbla. */
export function MascotSays({ mood, children, size = 64 }: { mood?: Mood; children: React.ReactNode; size?: number }) {
  return (
    <div className="flex items-end gap-3">
      <Mascot mood={mood} size={size} className="shrink-0" />
      <div className="relative mb-3 rounded-2xl rounded-bl-sm bg-paper px-4 py-2.5 text-sm font-medium text-ink shadow-sm ring-1 ring-line">{children}</div>
    </div>
  );
}
