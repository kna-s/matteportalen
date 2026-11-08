"use client";

import { MascotId, useStore } from "@/lib/store";
import { DEFAULT_OUTFIT, Outfit, getAccessory } from "@/lib/treasure";

/**
 * Maskotar att välja mellan. Alla ritas med paletten (CSS-variabler) så att
 * de alltid matchar sajtens färger. Tre humör: glad, hurra och tänker.
 */
/**
 * glad = vinkar, hurra = jublar, tanker = funderar, nickar = nickar uppmuntrande,
 * pekar = pekar på innehållet, dansar = dansar, forvanad = blir förvånad, laser = läser i en bok.
 * Sigge har alla; de andra maskotarna använder närmaste av glad/hurra/tanker.
 */
export type Mood = "glad" | "hurra" | "tanker" | "nickar" | "pekar" | "dansar" | "forvanad" | "laser";
export const ALL_MOODS: Mood[] = ["glad", "pekar", "nickar", "laser", "tanker", "forvanad", "hurra", "dansar"];

function baseMood(m: Mood): "glad" | "hurra" | "tanker" {
  if (m === "hurra" || m === "dansar" || m === "forvanad") return "hurra";
  if (m === "tanker") return "tanker";
  return "glad";
}

const NAVY = "var(--color-navy)";
const NAVY_L = "var(--color-navy-light)";
const ACCENT = "var(--icon-accent, var(--color-wine))";
const GOLD = "var(--color-gold)";
const GOLD_L = "var(--color-gold-light)";
const MINT = "#8fd3b6";
const MINT_D = "#5fb894";
const INK = "#1b2730";

/** Ögon och mun som delas av alla figurer. */
export function Face({ cx, cy, mood, gap = 9, eye = 4.2, color = INK }: { cx: number; cy: number; mood: Mood; gap?: number; eye?: number; color?: string }) {
  const lx = cx - gap;
  const rx = cx + gap;
  const closed = mood === "hurra" || mood === "dansar";
  const big = mood === "forvanad";
  const look = mood === "laser" ? 1.6 : 0; // tittar ner i boken
  const r = big ? eye * 1.25 : eye;
  return (
    <g>
      <g className="m-eyes">
        {closed ? (
          <>
            <path d={`M${lx - 4} ${cy + 1} Q${lx} ${cy - 5} ${lx + 4} ${cy + 1}`} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d={`M${rx - 4} ${cy + 1} Q${rx} ${cy - 5} ${rx + 4} ${cy + 1}`} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
          </>
        ) : mood === "tanker" ? (
          <>
            {/* tittar upp åt sidan, ett ögonbryn höjt */}
            <circle cx={lx + 1.2} cy={cy - 1.4} r={eye} fill={color} />
            <circle cx={rx + 1.2} cy={cy - 1.4} r={eye} fill={color} />
            <circle cx={lx + 2.4} cy={cy - 2.8} r={1.3} fill="#fff" />
            <circle cx={rx + 2.4} cy={cy - 2.8} r={1.3} fill="#fff" />
            <path d={`M${rx - 3.5} ${cy - 8.5} Q${rx + 0.5} ${cy - 11} ${rx + 4.5} ${cy - 8.5}`} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={lx} cy={cy + look} r={r} fill={color} />
            <circle cx={rx} cy={cy + look} r={r} fill={color} />
            <circle cx={lx + 1.3} cy={cy - 1.4 + look} r={big ? 1.8 : 1.4} fill="#fff" />
            <circle cx={rx + 1.3} cy={cy - 1.4 + look} r={big ? 1.8 : 1.4} fill="#fff" />
          </>
        )}
      </g>
      {mood === "tanker" ? (
        <path d={`M${cx - 4} ${cy + 10} Q${cx} ${cy + 8.5} ${cx + 4} ${cy + 9}`} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      ) : mood === "forvanad" ? (
        <ellipse cx={cx} cy={cy + 10} rx={3} ry={3.8} fill={color} />
      ) : closed ? (
        <path d={`M${cx - 6} ${cy + 7} Q${cx} ${cy + 16} ${cx + 6} ${cy + 7} Z`} fill={color} />
      ) : mood === "laser" ? (
        <path d={`M${cx - 3} ${cy + 9} Q${cx} ${cy + 11} ${cx + 3} ${cy + 9}`} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M${cx - 5} ${cy + 8} Q${cx} ${cy + 13} ${cx + 5} ${cy + 8}`} stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

export function Cheeks({ cx, cy, gap = 15 }: { cx: number; cy: number; gap?: number }) {
  return (
    <>
      <ellipse cx={cx - gap} cy={cy} rx={4} ry={2.6} style={{ fill: ACCENT }} opacity={0.4} />
      <ellipse cx={cx + gap} cy={cy} rx={4} ry={2.6} style={{ fill: ACCENT }} opacity={0.4} />
    </>
  );
}

/* Sigge – sköldpadda (stående, med mage framtill och skalet bakom) */
const MINT_L = "#b9e6d3";
/** Hattar och glasögon till Sigge (ritas på huvudet så att de följer med när han rör sig). */
function SiggeHat({ id }: { id?: string | null }) {
  switch (id) {
    case "kaptenshatt":
      return (
        <g>
          <path d="M24 16 Q50 -10 76 16 Q50 9 24 16 Z" fill="#1b2730" />
          <path d="M27 14.5 Q50 8 73 14.5" stroke={GOLD} strokeWidth={2} fill="none" />
          <circle cx={50} cy={6} r={3.2} fill="#fff" />
          <path d="M47.5 9.5 l5 -1 M47.5 8.5 l5 1" stroke="#fff" strokeWidth={1} />
        </g>
      );
    case "keps":
      return (
        <g>
          <path d="M30 17 Q31 0 50 0 Q69 0 70 17 Z" fill="#2f9e74" />
          <path d="M60 15 Q74 13 82 17 Q74 20 62 18 Z" fill="#23795a" />
          <circle cx={50} cy={1.5} r={2.2} fill="#23795a" />
          <path d="M50 1 V16" stroke="#23795a" strokeWidth={1.2} />
        </g>
      );
    case "trollkarlshatt":
      return (
        <g>
          <path d="M33 16 L54 -18 L67 16 Z" fill="#7a5fc2" />
          <ellipse cx={50} cy={16} rx={20} ry={4} fill="#5f47a0" />
          <path d="m50 -2 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" fill={GOLD} />
          <circle cx={58} cy={8} r={1.4} fill={GOLD} />
          <circle cx={45} cy={10} r={1} fill={GOLD} />
        </g>
      );
    case "krona":
      return (
        <g>
          <path d="M33 15 L34 0 L42 8 L50 -3 L58 8 L66 0 L67 15 Z" fill={GOLD} stroke="#b58a12" strokeWidth={1.2} strokeLinejoin="round" />
          <circle cx={50} cy={10} r={2.2} fill={ACCENT} />
          <circle cx={41} cy={11} r={1.6} fill="#1d7a94" />
          <circle cx={59} cy={11} r={1.6} fill="#1d7a94" />
        </g>
      );
    case "partyhatt":
      return (
        <g>
          <path d="M40 13 L52 -14 L62 13 Z" fill="#d6517a" />
          <path d="M44 4 L58 6 M47 -3 L55 -1" stroke="#fff" strokeWidth={2.5} />
          <circle cx={52} cy={-15} r={3.5} fill={GOLD} />
        </g>
      );
    default:
      return null;
  }
}

function SiggeGlasses({ id }: { id?: string | null }) {
  if (id === "runda-glasogon")
    return (
      <g fill="none" stroke="#1b2730" strokeWidth={1.8}>
        <circle cx={42} cy={28} r={6.2} fill="#ffffff33" />
        <circle cx={58} cy={28} r={6.2} fill="#ffffff33" />
        <path d="M48.2 28 H51.8 M35.8 27 L30 25 M64.2 27 L70 25" />
      </g>
    );
  if (id === "solglasogon")
    return (
      <g>
        <rect x={34} y={23} width={14} height={9} rx={4} fill="#1b2730" />
        <rect x={52} y={23} width={14} height={9} rx={4} fill="#1b2730" />
        <path d="M48 26 H52 M34 25 L29 23.5 M66 25 L71 23.5" stroke="#1b2730" strokeWidth={1.8} />
        <path d="M37 25.5 l3 -1.2 M55 25.5 l3 -1.2" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
      </g>
    );
  return null;
}

/** Tänkarpose: ena armen stöttar armbågen, andra handen mot hakan. */
function SiggeThinkArms() {
  const arm = (d: string) => <path d={d} stroke={MINT_D} strokeWidth={7} strokeLinecap="round" fill="none" />;
  return (
    <g>
      {/* vänster arm över magen, håller under armbågen */}
      {arm("M31 63 Q42 75 62 71")}
      {/* höger överarm ner till armbågen */}
      {arm("M69 62 Q69 68 64 70")}
      {/* underarm och hand mot hakan, knackar lätt */}
      <g className="m-arm-chin" style={{ transformOrigin: "64px 70px" }}>
        {arm("M64 70 Q64 59 56 53")}
        <circle cx={55} cy={51.5} r={4.6} fill={MINT_D} />
        <path d="M52.5 49.2 Q55 47.6 57.6 49" stroke={MINT} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </g>
      <circle cx={63} cy={71} r={3.8} fill={MINT_D} />
    </g>
  );
}

/** Tankebubblor som stiger upp bredvid huvudet. */
function ThinkBubbles() {
  return (
    <g className="m-think" fill="#fff" stroke={INK} strokeWidth={1.3}>
      <circle cx={74} cy={15} r={1.8} />
      <circle cx={79.5} cy={9.5} r={2.5} />
      <circle cx={86.5} cy={4.2} r={3.5} />
    </g>
  );
}

/** Sigges armar för varje humör. */
function SiggeArms({ mood }: { mood: Mood }) {
  const arm = (d: string) => <path d={d} stroke={MINT_D} strokeWidth={7} strokeLinecap="round" fill="none" />;
  switch (mood) {
    case "hurra":
    case "dansar":
      return (
        <>
          <g className="m-arm-l" style={{ transformOrigin: "31px 60px" }}>{arm("M31 60 Q20 50 18 38")}</g>
          <g className="m-arm-r" style={{ transformOrigin: "69px 60px" }}>{arm("M69 60 Q80 50 82 38")}</g>
        </>
      );
    case "tanker":
      // Armarna ritas framför magen och huvudet, se SiggeThinkArms.
      return null;
    case "pekar":
      return (
        <>
          {arm("M31 62 Q24 70 25 80")}
          <g className="m-arm-point" style={{ transformOrigin: "69px 61px" }}>
            {arm("M69 61 Q80 60 90 54")}
            <circle cx={92} cy={53} r={3.6} fill={MINT_D} />
          </g>
        </>
      );
    case "forvanad":
      return (
        <>
          <g className="m-arm-l" style={{ transformOrigin: "31px 60px" }}>{arm("M31 60 Q20 56 21 45")}</g>
          <g className="m-arm-r" style={{ transformOrigin: "69px 60px" }}>{arm("M69 60 Q80 56 79 45")}</g>
        </>
      );
    case "laser":
      return (
        <>
          {arm("M31 62 Q28 70 34 73")}
          {arm("M69 62 Q72 70 66 73")}
        </>
      );
    default:
      return (
        <>
          {arm("M31 62 Q24 70 25 80")}
          <g className={mood === "glad" ? "m-arm-wave" : ""} style={{ transformOrigin: "69px 62px" }}>{arm("M69 62 Q76 70 75 80")}</g>
        </>
      );
  }
}

function Sigge({ mood, outfit }: { mood: Mood; outfit?: Outfit }) {
  const scarf = getAccessory(outfit?.halsduk)?.color ?? ACCENT;
  return (
    <g>
      {/* skal bakom kroppen */}
      <ellipse cx={50} cy={70} rx={27} ry={24} style={{ fill: NAVY, stroke: GOLD }} strokeWidth={2.5} />
      <path d="M25 62 l4 -5 h4 M75 62 l-4 -5 h-4 M24 78 h5 l3 4 M76 78 h-5 l-3 4" style={{ stroke: NAVY_L }} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      {/* fötter */}
      <ellipse cx={39} cy={93} rx={8} ry={5} fill={MINT_D} />
      <ellipse cx={61} cy={93} rx={8} ry={5} fill={MINT_D} />
      {/* armar */}
      <SiggeArms mood={mood} />
      {/* mage */}
      <rect x={34} y={52} width={32} height={38} rx={15} style={{ fill: GOLD_L, stroke: GOLD }} strokeWidth={2} />
      <path d="M36 65 H64 M36 77 H64 M50 54 V88" style={{ stroke: GOLD }} strokeWidth={1.6} />
      {mood === "laser" && (
        <g className="m-book" style={{ transformOrigin: "50px 72px" }}>
          <path d="M32 64 L50 68 L68 64 L68 82 L50 86 L32 82 Z" style={{ fill: NAVY }} />
          <path d="M34 65 L50 69 L50 84 L34 80 Z M66 65 L50 69 L50 84 L66 80 Z" fill="#fffdf6" />
          <path d="M37 70 L47 72.5 M37 74 L47 76.5 M53 72.5 L63 70 M53 76.5 L63 74" stroke="#c9c2ad" strokeWidth={1.2} />
          <circle cx={34} cy={73} r={4} fill={MINT_D} />
          <circle cx={66} cy={73} r={4} fill={MINT_D} />
        </g>
      )}
      {/* halsduk */}
      <path d="M34 49 Q50 56 66 49 L64 55 Q50 62 36 55 Z" style={{ fill: scarf }} />
      <g className="m-scarf" style={{ transformOrigin: "60px 54px" }}>
        <path d="M58 54 l5 10 l-7 -1 Z" style={{ fill: scarf }} />
      </g>
      {/* huvud */}
      <g className="m-head" style={{ transformOrigin: "50px 50px" }}>
        <circle cx={50} cy={31} r={21} fill={MINT} />
        <ellipse cx={50} cy={40} rx={11} ry={6.5} fill={MINT_L} />
        <Face cx={50} cy={28} mood={mood} gap={8} eye={3.8} />
        <Cheeks cx={50} cy={37} gap={14} />
        <SiggeGlasses id={outfit?.glasogon} />
        <SiggeHat id={outfit?.hatt} />
      </g>
      {mood === "tanker" && (
        <>
          <SiggeThinkArms />
          <ThinkBubbles />
        </>
      )}
    </g>
  );
}

/* Bit – robot */
function Bit({ mood }: { mood: Mood }) {
  return (
    <g>
      {/* antenn */}
      <path d="M50 18 V8" style={{ stroke: NAVY }} strokeWidth={3} strokeLinecap="round" />
      <circle cx={50} cy={7} r={4.5} style={{ fill: mood === "hurra" ? ACCENT : GOLD }} />
      {/* armar */}
      {mood === "hurra" ? (
        <>
          <path d="M24 66 L12 46" style={{ stroke: NAVY_L }} strokeWidth={6} strokeLinecap="round" />
          <path d="M76 66 L88 46" style={{ stroke: NAVY_L }} strokeWidth={6} strokeLinecap="round" />
          <circle cx={11} cy={44} r={5} style={{ fill: GOLD }} />
          <circle cx={89} cy={44} r={5} style={{ fill: GOLD }} />
        </>
      ) : mood === "tanker" ? (
        <>
          <path d="M24 68 L14 80" style={{ stroke: NAVY_L }} strokeWidth={6} strokeLinecap="round" />
          <path d="M76 68 L70 54" style={{ stroke: NAVY_L }} strokeWidth={6} strokeLinecap="round" />
          <circle cx={14} cy={82} r={5} style={{ fill: GOLD }} />
          <circle cx={68} cy={50} r={5} style={{ fill: GOLD }} />
        </>
      ) : (
        <>
          <path d="M24 68 L14 80" style={{ stroke: NAVY_L }} strokeWidth={6} strokeLinecap="round" />
          <path d="M76 68 L86 80" style={{ stroke: NAVY_L }} strokeWidth={6} strokeLinecap="round" />
          <circle cx={14} cy={82} r={5} style={{ fill: GOLD }} />
          <circle cx={86} cy={82} r={5} style={{ fill: GOLD }} />
        </>
      )}
      {/* kropp */}
      <rect x={28} y={60} width={44} height={32} rx={10} style={{ fill: GOLD }} />
      <rect x={38} y={68} width={24} height={14} rx={4} style={{ fill: GOLD_L }} />
      <text x={50} y={79} textAnchor="middle" fontSize={10} fontWeight={700} style={{ fill: NAVY }}>
        1+1
      </text>
      {/* huvud */}
      <rect x={20} y={18} width={60} height={44} rx={14} style={{ fill: NAVY }} />
      <rect x={27} y={25} width={46} height={30} rx={9} fill="#e8fbf5" />
      <circle cx={18} cy={40} r={4} style={{ fill: ACCENT }} />
      <circle cx={82} cy={40} r={4} style={{ fill: ACCENT }} />
      <Face cx={50} cy={36} mood={mood} gap={10} eye={4} color="var(--color-navy)" />
    </g>
  );
}

/* Frida – räv */
function Frida({ mood }: { mood: Mood }) {
  return (
    <g>
      {/* svans */}
      <path d="M70 84 Q96 78 92 54 Q88 66 70 70 Z" style={{ fill: ACCENT }} />
      <path d="M92 54 Q93 62 88 66 Q90 58 86 56 Z" fill="#fff" />
      {/* kropp */}
      <ellipse cx={50} cy={78} rx={20} ry={16} style={{ fill: ACCENT }} />
      <ellipse cx={50} cy={82} rx={11} ry={10} fill="#fff6ee" />
      {/* armar */}
      {mood === "hurra" ? (
        <>
          <path d="M34 70 L20 52" style={{ stroke: ACCENT }} strokeWidth={7} strokeLinecap="round" />
          <path d="M66 70 L80 52" style={{ stroke: ACCENT }} strokeWidth={7} strokeLinecap="round" />
        </>
      ) : mood === "tanker" ? (
        <path d="M62 72 Q70 64 62 58" style={{ stroke: ACCENT }} strokeWidth={7} strokeLinecap="round" fill="none" />
      ) : null}
      {/* öron */}
      <path d="M26 30 L22 6 L44 20 Z" style={{ fill: ACCENT }} />
      <path d="M74 30 L78 6 L56 20 Z" style={{ fill: ACCENT }} />
      <path d="M28 24 L26 12 L38 20 Z" fill={INK} opacity={0.75} />
      <path d="M72 24 L74 12 L62 20 Z" fill={INK} opacity={0.75} />
      {/* huvud */}
      <path d="M18 36 Q20 14 50 14 Q80 14 82 36 Q80 56 50 64 Q20 56 18 36 Z" style={{ fill: ACCENT }} />
      <path d="M22 40 Q34 40 50 62 Q66 40 78 40 Q76 56 50 64 Q24 56 22 40 Z" fill="#fff6ee" />
      <ellipse cx={50} cy={52} rx={4} ry={3} fill={INK} />
      <Face cx={50} cy={36} mood={mood} gap={12} eye={4} />
      {/* glasögon */}
      <circle cx={38} cy={36} r={8} fill="none" style={{ stroke: NAVY }} strokeWidth={2} />
      <circle cx={62} cy={36} r={8} fill="none" style={{ stroke: NAVY }} strokeWidth={2} />
      <path d="M46 36 H54" style={{ stroke: NAVY }} strokeWidth={2} />
    </g>
  );
}

/* Pi – rund matte-figur */
function Pi({ mood }: { mood: Mood }) {
  return (
    <g>
      {mood === "hurra" ? (
        <>
          <path d="M22 58 L8 34" style={{ stroke: NAVY }} strokeWidth={6} strokeLinecap="round" />
          <path d="M78 58 L92 34" style={{ stroke: NAVY }} strokeWidth={6} strokeLinecap="round" />
        </>
      ) : mood === "tanker" ? (
        <>
          <path d="M22 66 L12 76" style={{ stroke: NAVY }} strokeWidth={6} strokeLinecap="round" />
          <path d="M78 64 L66 52" style={{ stroke: NAVY }} strokeWidth={6} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M22 66 L12 76" style={{ stroke: NAVY }} strokeWidth={6} strokeLinecap="round" />
          <path d="M78 66 L88 76" style={{ stroke: NAVY }} strokeWidth={6} strokeLinecap="round" />
        </>
      )}
      <rect x={20} y={28} width={60} height={62} rx={28} style={{ fill: GOLD }} />
      <ellipse cx={50} cy={76} rx={18} ry={11} style={{ fill: GOLD_L }} />
      <path d="M34 18 H66 M42 18 V30 M58 18 V30" style={{ stroke: NAVY }} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Face cx={50} cy={49} mood={mood} gap={10} eye={4.6} color="var(--color-navy)" />
      <Cheeks cx={50} cy={58} gap={18} />
    </g>
  );
}

const FIGURES: Record<MascotId, (p: { mood: Mood; outfit?: Outfit }) => React.ReactElement> = { sigge: Sigge, bit: Bit, frida: Frida, pi: Pi };

/**
 * animate: maskoten andas, blinkar och rör sig efter humöret
 * (hälsar = vinkar, firar = hoppar och viftar, tänker = lutar huvudet).
 * Stängs av automatiskt för den som valt "minska rörelse" i sin dator.
 */
export default function Mascot({
  mood = "glad",
  size = 72,
  className = "",
  kind,
  animate = true,
  outfit,
}: {
  mood?: Mood;
  size?: number;
  className?: string;
  kind?: MascotId;
  animate?: boolean;
  /** Kläder att visa. Utan värde används elevens egna kläder. */
  outfit?: Outfit;
}) {
  const { state } = useStore();
  const id = kind ?? state.mascot ?? "sigge";
  const sid = state.session?.role === "elev" ? state.session.studentId : undefined;
  const wear = outfit ?? (sid ? (state.outfits?.[sid] ?? DEFAULT_OUTFIT) : DEFAULT_OUTFIT);
  const Figure = FIGURES[id];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${animate ? `mascot mascot-${id === "sigge" ? mood : baseMood(mood)}` : ""} overflow-visible ${className}`}
      role="img"
      aria-label={`Maskoten ${id}`}
    >
      <g className="m-body">
        <Figure mood={id === "sigge" ? mood : baseMood(mood)} outfit={wear} />
      </g>
    </svg>
  );
}

/** Maskoten med en pratbubbla. */
export function MascotSays({ mood, children, size = 64 }: { mood?: Mood; children: React.ReactNode; size?: number }) {
  return (
    <div className="flex items-end gap-3">
      <Mascot mood={mood} size={size} className="shrink-0" />
      <div className="relative mb-3 rounded-2xl rounded-bl-sm bg-paper px-4 py-2.5 text-sm font-medium text-ink shadow-sm ring-1 ring-line">{children}</div>
    </div>
  );
}
