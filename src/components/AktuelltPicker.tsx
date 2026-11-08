"use client";

import { useState } from "react";
import { AREAS, chaptersFor, getChapter } from "@/lib/curriculum";
import { Student, useStore } from "@/lib/store";

/** Låter föräldern välja vilka kapitel som visas som "Aktuellt" för ett barn. */
export default function AktuelltPicker({ student }: { student: Student }) {
  const { state, update } = useStore();
  const [open, setOpen] = useState(false);
  const [areaId, setAreaId] = useState(AREAS[0].id);
  const selected = state.aktuellt[student.id] ?? [];

  const toggle = (id: string) =>
    update((s) => {
      const cur = s.aktuellt[student.id] ?? [];
      return { ...s, aktuellt: { ...s.aktuellt, [student.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } };
    });

  return (
    <div className="rounded-xl border border-wine/20 bg-wine/5 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-navy">📌 Aktuellt för {student.name}</p>
        <button onClick={() => setOpen((o) => !o)} className="font-semibold text-wine hover:underline" aria-expanded={open}>
          {open ? "Klar" : "Ändra"}
        </button>
      </div>
      <p className="text-xs text-muted">Det du väljer här visas överst på {student.name}s startsida, t.ex. det de jobbar med i skolan just nu.</p>

      {selected.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-navy shadow-sm">
              {getChapter(id)?.title}
              <button onClick={() => toggle(id)} aria-label={`Ta bort ${getChapter(id)?.title}`} className="text-muted hover:text-bad">
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs italic text-muted">Inget valt än.</p>
      )}

      {open && (
        <div className="mt-3 rounded-lg bg-paper p-3">
          <select className="input !py-1.5 text-sm" value={areaId} onChange={(e) => setAreaId(e.target.value)} aria-label="Område">
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.title}
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-col gap-1">
            {chaptersFor(student.grade, areaId).map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-cream">
                <input type="checkbox" className="h-4 w-4 accent-wine" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                {c.title}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
