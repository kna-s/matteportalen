"use client";

import { useRef, useState } from "react";

/** Ett verktyg som ligger ovanpå sidan och kan dras och vridas (linjal, gradskiva). */
export default function Draggable({
  children,
  initial = { x: 120, y: 200 },
  onClose,
  label,
}: {
  children: React.ReactNode;
  initial?: { x: number; y: number };
  onClose: () => void;
  label: string;
}) {
  const [pos, setPos] = useState(initial);
  const [angle, setAngle] = useState(0);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  return (
    <div
      className="fixed z-50 touch-none select-none"
      style={{ left: pos.x, top: pos.y, transform: `rotate(${angle}deg)`, transformOrigin: "center" }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => drag.current && setPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy })}
      onPointerUp={() => (drag.current = null)}
      role="dialog"
      aria-label={label}
    >
      <div className="cursor-grab active:cursor-grabbing">{children}</div>
      <div className="mt-1 flex justify-center gap-1" style={{ transform: `rotate(${-angle}deg)` }}>
        <button className="rounded bg-navy px-2 py-0.5 text-xs text-white" onClick={() => setAngle((a) => a - 15)} aria-label="Vrid vänster">
          ⟲
        </button>
        <span className="rounded bg-paper px-2 py-0.5 text-xs shadow">{((angle % 360) + 360) % 360}°</span>
        <button className="rounded bg-navy px-2 py-0.5 text-xs text-white" onClick={() => setAngle((a) => a + 15)} aria-label="Vrid höger">
          ⟳
        </button>
        <button className="rounded bg-wine px-2 py-0.5 text-xs text-white" onClick={onClose} aria-label="Stäng">
          ✕
        </button>
      </div>
    </div>
  );
}

export function Ruler() {
  const cm = 15;
  const px = 38; // ungefär 1 cm på skärmen
  return (
    <svg width={cm * px + 20} height={60} className="drop-shadow-md">
      <rect x={0} y={0} width={cm * px + 20} height={60} rx={6} fill="#f3e7bf" fillOpacity={0.92} stroke="#c9a227" />
      {Array.from({ length: cm * 10 + 1 }, (_, i) => {
        const x = 10 + (i * px) / 10;
        const h = i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9;
        return <line key={i} x1={x} x2={x} y1={0} y2={h} stroke="#1b2a4a" strokeWidth={i % 10 === 0 ? 1.4 : 0.7} />;
      })}
      {Array.from({ length: cm + 1 }, (_, i) => (
        <text key={i} x={10 + i * px} y={38} fontSize={12} textAnchor="middle" fill="#1b2a4a">
          {i}
        </text>
      ))}
      <text x={cm * px + 6} y={54} fontSize={10} textAnchor="end" fill="#5d6475">
        cm
      </text>
    </svg>
  );
}

export function Protractor() {
  const r = 150;
  return (
    <svg width={2 * r + 20} height={r + 30} className="drop-shadow-md">
      <path d={`M10 ${r + 10} A ${r} ${r} 0 0 1 ${2 * r + 10} ${r + 10} Z`} fill="#dfe6f3" fillOpacity={0.9} stroke="#1b2a4a" />
      {Array.from({ length: 181 }, (_, d) => {
        const a = (Math.PI * d) / 180;
        const len = d % 10 === 0 ? 16 : d % 5 === 0 ? 10 : 5;
        const x1 = r + 10 + r * Math.cos(Math.PI - a);
        const y1 = r + 10 - r * Math.sin(Math.PI - a);
        const x2 = r + 10 + (r - len) * Math.cos(Math.PI - a);
        const y2 = r + 10 - (r - len) * Math.sin(Math.PI - a);
        return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1b2a4a" strokeWidth={d % 10 === 0 ? 1.2 : 0.6} />;
      })}
      {Array.from({ length: 19 }, (_, i) => {
        const d = i * 10;
        const a = (Math.PI * d) / 180;
        return (
          <text key={d} x={r + 10 + (r - 28) * Math.cos(Math.PI - a)} y={r + 14 - (r - 28) * Math.sin(Math.PI - a)} fontSize={10} textAnchor="middle" fill="#1b2a4a">
            {d}
          </text>
        );
      })}
      <circle cx={r + 10} cy={r + 10} r={3} fill="#7a1f2b" />
      <line x1={10} x2={2 * r + 10} y1={r + 10} y2={r + 10} stroke="#1b2a4a" />
    </svg>
  );
}
