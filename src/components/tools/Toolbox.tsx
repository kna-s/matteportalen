"use client";

import { useState } from "react";
import { TOOL_LABELS, ToolId } from "@/lib/curriculum";
import { useStore } from "@/lib/store";
import Icon from "@/components/icons/Icon";
import Calculator from "./Calculator";
import Draggable, { Protractor, Ruler } from "./Draggable";
import { CoordinateSystem, NumberLine } from "./Graphs";


/** Hjälpmedel som våra lärare slår på per uppgift (Step.tools). */
export default function Toolbox({ tools }: { tools: ToolId[] }) {
  const [open, setOpen] = useState<ToolId[]>([]);
  const { state, markToolUsed } = useStore();
  if (!tools.length) return null;
  const toggle = (t: ToolId) => {
    if (!open.includes(t) && state.session?.role === "elev" && state.session.studentId) markToolUsed(state.session.studentId, t);
    setOpen((o) => (o.includes(t) ? o.filter((x) => x !== t) : [...o, t]));
  };
  const panelTools = open.filter((t) => t === "kalkylator" || t === "koordinatsystem" || t === "tallinje");

  return (
    <>
      <div className="card !p-3">
        <p className="mb-2 text-sm font-semibold text-navy">Hjälpmedel</p>
        <div className="flex flex-wrap gap-2">
          {tools.map((t) => (
            <button
              key={t}
              onClick={() => toggle(t)}
              aria-pressed={open.includes(t)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                open.includes(t) ? "border-navy bg-navy text-white" : "border-line bg-paper text-navy hover:bg-gold-light"
              }`}
            >
              <Icon name={t} size={20} className={open.includes(t) ? "icon-invert" : ""} />
              {TOOL_LABELS[t]}
            </button>
          ))}
        </div>
        {panelTools.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-4">
            {panelTools.map((t) => (
              <div key={t} className="rounded-xl border border-line bg-cream p-3">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-navy">
                  {TOOL_LABELS[t]}
                  <button onClick={() => toggle(t)} aria-label={`Stäng ${TOOL_LABELS[t]}`} className="text-muted hover:text-wine">
                    ✕
                  </button>
                </div>
                {t === "kalkylator" && <Calculator />}
                {t === "koordinatsystem" && <CoordinateSystem />}
                {t === "tallinje" && <NumberLine />}
              </div>
            ))}
          </div>
        )}
      </div>
      {open.includes("linjal") && (
        <Draggable label="Linjal" onClose={() => toggle("linjal")} initial={{ x: 60, y: 260 }}>
          <Ruler />
        </Draggable>
      )}
      {open.includes("gradskiva") && (
        <Draggable label="Gradskiva" onClose={() => toggle("gradskiva")} initial={{ x: 200, y: 300 }}>
          <Protractor />
        </Draggable>
      )}
    </>
  );
}
