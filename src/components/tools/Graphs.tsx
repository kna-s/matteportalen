"use client";

import { useState } from "react";

/** Koordinatsystem där eleven klickar för att sätta ut punkter. */
export function CoordinateSystem() {
  const [max, setMax] = useState(10);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const size = 300;
  const pad = 24;
  const step = (size - 2 * pad) / max;
  const toPx = (v: number) => pad + v * step;

  return (
    <div className="w-[300px]">
      <svg
        width={size}
        height={size}
        className="cursor-crosshair rounded-lg bg-paper"
        onClick={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = Math.round((e.clientX - rect.left - pad) / step);
          const y = Math.round((size - (e.clientY - rect.top) - pad) / step);
          if (x < 0 || y < 0 || x > max || y > max) return;
          setPoints((p) => [...p, { x, y }]);
        }}
      >
        {Array.from({ length: max + 1 }, (_, i) => (
          <g key={i}>
            <line x1={toPx(i)} x2={toPx(i)} y1={size - pad} y2={size - toPx(max)} stroke="#e5dfcf" />
            <line y1={size - toPx(i)} y2={size - toPx(i)} x1={pad} x2={toPx(max)} stroke="#e5dfcf" />
            <text x={toPx(i)} y={size - 8} fontSize={9} textAnchor="middle" fill="#5d6475">
              {i}
            </text>
            {i > 0 && (
              <text x={12} y={size - toPx(i) + 3} fontSize={9} textAnchor="middle" fill="#5d6475">
                {i}
              </text>
            )}
          </g>
        ))}
        <line x1={pad} x2={toPx(max)} y1={size - pad} y2={size - pad} stroke="#1b2a4a" strokeWidth={1.5} />
        <line x1={pad} x2={pad} y1={size - pad} y2={size - toPx(max)} stroke="#1b2a4a" strokeWidth={1.5} />
        {points.length > 1 && (
          <polyline points={points.map((p) => `${toPx(p.x)},${size - toPx(p.y)}`).join(" ")} fill="none" stroke="#7a1f2b" strokeDasharray="4 3" />
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={toPx(p.x)} cy={size - toPx(p.y)} r={4} fill="#7a1f2b" />
            <text x={toPx(p.x) + 6} y={size - toPx(p.y) - 6} fontSize={10} fill="#7a1f2b">
              ({p.x}, {p.y})
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between gap-2 text-sm">
        <label className="flex items-center gap-1">
          Axlar till
          <select className="input !w-auto !px-2 !py-0.5" value={max} onChange={(e) => (setMax(Number(e.target.value)), setPoints([]))}>
            {[5, 10, 20].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <button className="text-wine underline" onClick={() => setPoints([])}>
          Rensa punkter
        </button>
      </div>
    </div>
  );
}

/** Tallinje med valbart intervall, även negativa tal och tiondelar. */
export function NumberLine() {
  const [range, setRange] = useState<"0-10" | "-10-10" | "0-1" | "0-100">("-10-10");
  const [marks, setMarks] = useState<number[]>([]);
  const cfg = {
    "0-10": { min: 0, max: 10, step: 1 },
    "-10-10": { min: -10, max: 10, step: 1 },
    "0-1": { min: 0, max: 1, step: 0.1 },
    "0-100": { min: 0, max: 100, step: 10 },
  }[range];
  const w = 340;
  const pad = 16;
  const n = Math.round((cfg.max - cfg.min) / cfg.step);
  const toPx = (v: number) => pad + ((v - cfg.min) / (cfg.max - cfg.min)) * (w - 2 * pad);
  const fmt = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");

  return (
    <div className="w-[340px]">
      <svg
        width={w}
        height={80}
        className="cursor-pointer rounded-lg bg-paper"
        onClick={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const raw = cfg.min + ((e.clientX - rect.left - pad) / (w - 2 * pad)) * (cfg.max - cfg.min);
          const snap = Math.round(raw / (cfg.step / 2)) * (cfg.step / 2);
          if (snap < cfg.min || snap > cfg.max) return;
          setMarks((m) => (m.includes(snap) ? m.filter((x) => x !== snap) : [...m, snap]));
        }}
      >
        <line x1={pad - 8} x2={w - pad + 8} y1={40} y2={40} stroke="#1b2a4a" strokeWidth={2} />
        {Array.from({ length: n + 1 }, (_, i) => {
          const v = cfg.min + i * cfg.step;
          return (
            <g key={i}>
              <line x1={toPx(v)} x2={toPx(v)} y1={32} y2={48} stroke="#1b2a4a" />
              <text x={toPx(v)} y={64} fontSize={10} textAnchor="middle" fill={v < 0 ? "#7a1f2b" : "#1b2a4a"}>
                {fmt(v)}
              </text>
            </g>
          );
        })}
        {marks.map((m) => (
          <g key={m}>
            <circle cx={toPx(m)} cy={40} r={6} fill="#c9a227" stroke="#1b2a4a" />
            <text x={toPx(m)} y={22} fontSize={11} textAnchor="middle" fontWeight="bold" fill="#1b2a4a">
              {fmt(m)}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-sm">
        <select className="input !w-auto !px-2 !py-0.5" value={range} onChange={(e) => (setRange(e.target.value as typeof range), setMarks([]))}>
          <option value="-10-10">−10 till 10</option>
          <option value="0-10">0 till 10</option>
          <option value="0-1">0 till 1 (tiondelar)</option>
          <option value="0-100">0 till 100</option>
        </select>
        <button className="text-wine underline" onClick={() => setMarks([])}>
          Rensa
        </button>
      </div>
    </div>
  );
}
