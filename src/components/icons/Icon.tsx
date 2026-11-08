/**
 * Mega Akademins egna ikoner (ersätter emojis). Ritade i 24×24 med rundade
 * linjer i primärfärgen och en mjuk fyllnad i palettens färger, så att de
 * alltid matchar sajten.
 *
 *   --icon-stroke  linjefärg   (standard: primär)
 *   --icon-fill    fyllnad     (standard: gul highlight)
 *   --icon-accent  detalj      (standard: accent/orange)
 */

const S = "var(--icon-stroke, var(--color-navy))";
const F = "var(--icon-fill, var(--color-gold))";
const A = "var(--icon-accent, var(--color-wine))";
const W = "var(--color-paper)";

const line = { stroke: S, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const filled = (fill: string) => ({ ...line, fill });

const ICONS = {
  /* ---------- Navigering ---------- */
  hem: (
    <>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" {...filled(F)} />
      <path d="M10 20v-5a2 2 0 0 1 4 0v5" {...filled(W)} />
      <path d="M2.5 11.5 12 3.5l9.5 8" {...line} />
    </>
  ),
  arskurs: (
    <>
      <path d="M2.5 9 12 4.5 21.5 9 12 13.5z" {...filled(F)} />
      <path d="M6.5 11v4.5c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3V11" {...line} />
      <path d="M21.5 9v5" {...line} />
      <circle cx={21.5} cy={15} r={1.2} fill={A} />
    </>
  ),
  video: (
    <>
      <rect x={2.5} y={5} width={19} height={14} rx={3} {...filled(F)} />
      <path d="M10 9.3v5.4a.6.6 0 0 0 .9.5l4.3-2.7a.6.6 0 0 0 0-1l-4.3-2.7a.6.6 0 0 0-.9.5z" fill={A} stroke={A} strokeWidth={1} strokeLinejoin="round" />
    </>
  ),
  ovning: (
    <>
      <rect x={4} y={3} width={13} height={18} rx={2} {...filled(W)} />
      <path d="M7.5 8h6M7.5 11.5h4M7.5 15h3" {...line} />
      <path d="M19.8 9.2 13.5 18l-2.3.8.3-2.4 6.3-8.8a1.2 1.2 0 0 1 2 1.6z" {...filled(F)} />
      <path d="M11.2 18.8l.3-2.4 2 1.6z" fill={A} />
    </>
  ),
  quiz: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" {...filled(F)} />
      <path d="M7 6H4.5v1.5A3 3 0 0 0 7.5 10.5M17 6h2.5v1.5a3 3 0 0 1-3 3" {...line} />
      <path d="M12 14v3.5M8.5 20.5h7M9.5 20.5c0-1.7 1-3 2.5-3s2.5 1.3 2.5 3" {...line} />
      <path d="m12 6.2.8 1.6 1.7.2-1.3 1.2.4 1.7-1.6-.9-1.6.9.4-1.7L9.5 8l1.7-.2z" fill={A} />
    </>
  ),
  screening: (
    <>
      <circle cx={10.5} cy={10.5} r={6.5} {...filled(W)} />
      <path d="M8 13v-2M10.5 13V8.5M13 13v-3" stroke={A} strokeWidth={2} strokeLinecap="round" />
      <path d="m15.5 15.5 5 5" {...line} strokeWidth={2.6} />
      <circle cx={10.5} cy={10.5} r={6.5} {...line} />
    </>
  ),
  resultat: (
    <>
      <rect x={4} y={13} width={4} height={7} rx={1} {...filled(F)} />
      <rect x={10} y={9} width={4} height={11} rx={1} {...filled(F)} />
      <rect x={16} y={5} width={4} height={15} rx={1} {...filled(A)} />
      <path d="M3 20.5h18" {...line} />
    </>
  ),
  marken: (
    <>
      <path d="m8.5 13.5-2 7.5 3-1.5 2 2 1-6M15.5 13.5l2 7.5-3-1.5-2 2" {...filled(A)} />
      <circle cx={12} cy={9} r={6} {...filled(F)} />
      <path d="m12 6.2.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill={W} stroke={S} strokeWidth={1} strokeLinejoin="round" />
    </>
  ),
  foraldraportal: (
    <>
      <circle cx={8.5} cy={6.5} r={3} {...filled(F)} />
      <path d="M3 20v-3.5A4.5 4.5 0 0 1 7.5 12h2A4.5 4.5 0 0 1 14 16.5V20" {...filled(F)} />
      <circle cx={17} cy={10} r={2.3} {...filled(A)} />
      <path d="M13.8 20v-2.2a3 3 0 0 1 3-3h.4a3 3 0 0 1 3 3V20" {...filled(A)} />
    </>
  ),
  abonnemang: (
    <>
      <rect x={2.5} y={5.5} width={19} height={13} rx={2.5} {...filled(F)} />
      <path d="M2.5 9.5h19" {...line} strokeWidth={2.6} />
      <path d="M6 15h4" {...line} />
      <circle cx={17} cy={15} r={1.5} fill={A} />
    </>
  ),
  admin: (
    <>
      <g transform="translate(12 12)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
          <rect key={r} x={-2.2} y={-10} width={4.4} height={5} rx={1.2} transform={`rotate(${r})`} fill={F} stroke={S} strokeWidth={1.6} strokeLinejoin="round" />
        ))}
        <circle r={7} fill={F} stroke={S} strokeWidth={1.8} />
        <circle r={2.8} fill={W} stroke={S} strokeWidth={1.6} />
        <circle r={1.1} fill={A} />
      </g>
    </>
  ),
  kursplan: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5z" {...filled(F)} />
      <path d="M12 6.5c2-1.5 5-2 8.5-1.5v13c-3.5-.5-6.5 0-8.5 1.5z" {...filled(W)} />
      <path d="M14.5 9.5c1.5-.5 3-.6 4-.5M14.5 12.5c1.5-.5 3-.6 4-.5" stroke={A} strokeWidth={1.6} strokeLinecap="round" />
    </>
  ),

  /* ---------- Områden ---------- */
  taluppfattning: (
    <>
      <rect x={3} y={3} width={18} height={18} rx={4} {...filled(F)} />
      <text x={12} y={15.8} textAnchor="middle" fontSize={8.5} fontWeight={800} fill={S} fontFamily="var(--font-body), sans-serif">
        123
      </text>
    </>
  ),
  algebra: (
    <>
      <rect x={3} y={3} width={18} height={18} rx={4} {...filled(F)} />
      <path d="m7 8.5 4 5M11 8.5l-4 5" stroke={A} strokeWidth={2} strokeLinecap="round" />
      <path d="M13.5 10h4M13.5 13h4" {...line} strokeWidth={2} />
      <path d="M7 17h10" {...line} strokeDasharray="1.5 2.2" />
    </>
  ),
  geometri: (
    <>
      <rect x={11.5} y={11.5} width={9} height={9} rx={1} {...filled(W)} />
      <circle cx={8} cy={15.5} r={4.5} {...filled(A)} />
      <path d="M12 3.5 17.5 12h-11z" {...filled(F)} />
    </>
  ),
  sannolikhet: (
    <>
      <rect x={3.5} y={3.5} width={17} height={17} rx={4} transform="rotate(-8 12 12)" {...filled(F)} />
      <g transform="rotate(-8 12 12)" fill={S}>
        <circle cx={8} cy={8} r={1.4} />
        <circle cx={16} cy={8} r={1.4} />
        <circle cx={12} cy={12} r={1.4} fill={A} />
        <circle cx={8} cy={16} r={1.4} />
        <circle cx={16} cy={16} r={1.4} />
      </g>
    </>
  ),
  samband: (
    <>
      <rect x={3} y={3} width={18} height={18} rx={4} {...filled(W)} />
      <path d="M6.5 6v11.5H18" {...line} />
      <path d="m7.5 16 9.5-8.5" stroke={A} strokeWidth={2} strokeLinecap="round" />
      <circle cx={10.5} cy={13.3} r={1.5} fill={F} stroke={S} strokeWidth={1.2} />
      <circle cx={14.5} cy={9.8} r={1.5} fill={F} stroke={S} strokeWidth={1.2} />
    </>
  ),
  problemlosning: (
    <>
      <path d="M12 4.5a6 6 0 0 0-3.7 10.7c.7.6 1.2 1.4 1.2 2.3v.5h5v-.5c0-.9.5-1.7 1.2-2.3A6 6 0 0 0 12 4.5z" {...filled(F)} />
      <path d="M10 21h4M9.5 18h5" {...line} />
      <path d="M12 1.5v1.2M4.2 4.7l.9.9M19.8 4.7l-.9.9M2.5 11h1.2M20.3 11h1.2" stroke={A} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M10.6 9.3a1.5 1.5 0 1 1 2.1 1.4c-.5.2-.7.6-.7 1.1v.4" {...line} strokeWidth={1.6} />
      <circle cx={12} cy={14.2} r={0.9} fill={S} />
    </>
  ),

  /* ---------- Hjälpmedel ---------- */
  kalkylator: (
    <>
      <rect x={5} y={2.5} width={14} height={19} rx={2.5} {...filled(F)} />
      <rect x={7.5} y={5} width={9} height={4} rx={1} {...filled(W)} />
      <g fill={S}>
        <circle cx={9} cy={12.5} r={1} />
        <circle cx={12} cy={12.5} r={1} />
        <circle cx={9} cy={15.5} r={1} />
        <circle cx={12} cy={15.5} r={1} />
        <circle cx={9} cy={18.5} r={1} />
        <circle cx={12} cy={18.5} r={1} />
      </g>
      <rect x={14.2} y={11.5} width={2.2} height={8} rx={1.1} fill={A} />
    </>
  ),
  linjal: (
    <>
      <rect x={2} y={8} width={20} height={8} rx={1.5} {...filled(F)} />
      <path d="M5.5 8v3M9 8v2M12.5 8v3M16 8v2M19.5 8v3" {...line} strokeWidth={1.5} />
    </>
  ),
  gradskiva: (
    <>
      <path d="M2.5 18a9.5 9.5 0 0 1 19 0z" {...filled(F)} />
      <path d="M12 18 17 10.5" stroke={A} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M8 18a4 4 0 0 1 8 0" {...line} strokeWidth={1.4} />
      <circle cx={12} cy={18} r={1.2} fill={S} />
    </>
  ),
  koordinatsystem: (
    <>
      <rect x={3} y={3} width={18} height={18} rx={4} {...filled(W)} />
      <path d="M9 3.5v17M15 3.5v17M3.5 9h17M3.5 15h17" stroke={S} strokeOpacity={0.18} strokeWidth={1} />
      <path d="M12 5.5v13M5.5 12h13" {...line} />
      <circle cx={15.5} cy={8.5} r={2.2} fill={A} stroke={S} strokeWidth={1.2} />
    </>
  ),
  tallinje: (
    <>
      <rect x={2} y={10} width={20} height={4} rx={2} {...filled(F)} />
      <path d="M6 8v8M12 7.5v9M18 8v8" {...line} />
      <circle cx={15} cy={12} r={2.4} fill={A} stroke={S} strokeWidth={1.4} />
    </>
  ),

  /* ---------- Övrigt ---------- */
  mal: (
    <>
      <circle cx={11} cy={13} r={8} {...filled(W)} />
      <circle cx={11} cy={13} r={5} {...filled(F)} />
      <circle cx={11} cy={13} r={1.8} fill={A} />
      <path d="m11 13 8.5-8.5M16.5 4.5h3v3" {...line} />
    </>
  ),
  prat: (
    <>
      <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-9l-4.5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z" {...filled(F)} />
      <circle cx={8} cy={11.5} r={1.1} fill={S} />
      <circle cx={12} cy={11.5} r={1.1} fill={S} />
      <circle cx={16} cy={11.5} r={1.1} fill={A} />
    </>
  ),
  kalender: (
    <>
      <rect x={3} y={5} width={18} height={16} rx={2.5} {...filled(W)} />
      <path d="M3 10h18" {...line} />
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5V10H3z" fill={A} stroke={S} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M8 3v4M16 3v4" {...line} />
      <rect x={7} y={13} width={3} height={3} rx={0.8} fill={F} stroke={S} strokeWidth={1.2} />
    </>
  ),
  plus: (
    <>
      <circle cx={12} cy={12} r={9} {...filled(F)} />
      <path d="M12 8v8M8 12h8" {...line} strokeWidth={2.2} />
    </>
  ),
  brev: (
    <>
      <rect x={3} y={6} width={18} height={13} rx={2} {...filled(F)} />
      <path d="m3.5 7 8.5 6.5L20.5 7" {...line} />
      <circle cx={19} cy={6} r={2.6} fill={A} stroke={S} strokeWidth={1.4} />
    </>
  ),
  elev: (
    <>
      <path d="M6 21v-2.5A5.5 5.5 0 0 1 11.5 13h1a5.5 5.5 0 0 1 5.5 5.5V21" {...filled(A)} />
      <circle cx={12} cy={8} r={4} {...filled(F)} />
      <path d="M8 6.5c1-2.5 6-3.5 8 0" stroke={S} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </>
  ),
  aktuellt: (
    <>
      <path d="M9 3.5h6l-1 5 3 3v1.5H7v-1.5l3-3z" {...filled(A)} />
      <path d="M12 13v7.5" {...line} />
    </>
  ),
  lyssna: (
    <>
      <path d="M4 9.5h3l5-4v13l-5-4H4z" {...filled(F)} />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke={A} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </>
  ),
  las: (
    <>
      <rect x={4.5} y={10.5} width={15} height={10} rx={2.5} {...filled(F)} />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...line} />
      <circle cx={12} cy={15.5} r={1.5} fill={A} />
    </>
  ),
  klar: (
    <>
      <circle cx={12} cy={12} r={9} {...filled(F)} />
      <path d="m8 12.3 2.8 2.7L16 9.5" stroke={S} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  stjarna: (
    <path d="m12 3 2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.8z" {...filled(F)} />
  ),
  firande: (
    <>
      <path d="M4 20 8.5 7.5l8 8z" {...filled(F)} />
      <path d="M6.3 14 10 17.7M7.4 10.8 13.2 16.6" stroke={A} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M14 4.5c0 1.5 1 2 2 2M19.5 8.5c-1.2.3-1.8 1-1.5 2.2M18 3.5v1.5M21 5.5h-1.5" stroke={A} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  ),
};

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export default function Icon({ name, size = 24, className = "", title }: { name: IconName; size?: number; className?: string; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {ICONS[name]}
    </svg>
  );
}
