"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = ["#13292f", "#0e4f61", "#f07c3e", "#2f9e74", "#d6517a"];

/** Enkel rityta för övningar. Sparar teckningen som bild (data-URL). */
export default function DrawPad({ value, onChange, disabled }: { value?: string; onChange: (dataUrl: string) => void; disabled?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [eraser, setEraser] = useState(false);
  const [size, setSize] = useState(4);

  // Rita upp sparad teckning och anpassa upplösningen till skärmen.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
    // Ritas bara upp när komponenten skapas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const line = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvas.current!.getContext("2d")!;
    ctx.globalCompositeOperation = eraser ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = eraser ? size * 5 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const save = () => onChange(canvas.current!.toDataURL("image/png"));

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => (setColor(c), setEraser(false))}
            className={`h-8 w-8 rounded-full ring-offset-2 ${!eraser && color === c ? "ring-2 ring-navy" : ""}`}
            style={{ background: c }}
            aria-label={`Färg ${c}`}
            disabled={disabled}
          />
        ))}
        <span className="mx-1 h-6 w-px bg-line" />
        {[3, 6, 10].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={`grid h-8 w-8 place-items-center rounded-lg ${size === s ? "bg-navy/10" : "hover:bg-cream"}`}
            aria-label={`Penna storlek ${s}`}
            disabled={disabled}
          >
            <span className="rounded-full bg-ink" style={{ width: s + 2, height: s + 2 }} />
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-line" />
        <button
          type="button"
          onClick={() => setEraser((e) => !e)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${eraser ? "bg-navy text-white" : "bg-cream text-navy"}`}
          disabled={disabled}
        >
          Sudd
        </button>
        <button
          type="button"
          onClick={() => {
            const c = canvas.current!;
            c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
            save();
          }}
          className="rounded-lg bg-cream px-3 py-1.5 text-sm font-semibold text-wine"
          disabled={disabled}
        >
          Rensa
        </button>
      </div>
      <canvas
        ref={canvas}
        className={`h-72 w-full touch-none rounded-xl border border-line bg-paper ${disabled ? "cursor-not-allowed opacity-70" : eraser ? "cursor-cell" : "cursor-crosshair"}`}
        style={{ backgroundImage: "radial-gradient(var(--color-line) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        onPointerDown={(e) => {
          if (disabled) return;
          drawing.current = true;
          last.current = pos(e);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          line(last.current, last.current);
        }}
        onPointerMove={(e) => {
          if (!drawing.current || !last.current) return;
          const p = pos(e);
          line(last.current, p);
          last.current = p;
        }}
        onPointerUp={() => {
          if (!drawing.current) return;
          drawing.current = false;
          save();
        }}
        aria-label="Rityta"
      />
    </div>
  );
}
