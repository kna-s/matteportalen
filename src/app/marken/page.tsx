"use client";

import Icon from "@/components/icons/Icon";
import { useState } from "react";
import { BADGES, BadgeCategory, CATEGORY_INFO } from "@/lib/badges";
import { emptyProgress, useStore } from "@/lib/store";
import { BadgeDetail, BadgeMedal } from "@/components/Badges";
import { MascotSays } from "@/components/Mascot";
import { RequireLogin, SectionTabs, StudentPicker } from "@/components/ui";

function BadgeTabs() {
  const { state } = useStore();
  if (state.session?.role !== "elev") return null;
  return (
    <SectionTabs
      tabs={[
          { href: "/marken", label: "Mina märken", icon: "marken" },
          { href: "/garderob", label: "Sigges garderob", icon: "hatt" },
        ]}
    />
  );
}

export default function BadgesPage() {
  return (
    <RequireLogin roles={["elev", "foralder"]}>
      <StudentPicker />
      <BadgeTabs />
      <Content />
    </RequireLogin>
  );
}

function Content() {
  const { state, tier, currentStudent } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  if (!currentStudent) return null;
  const p = state.progress[currentStudent.id] ?? emptyProgress();
  const ctx = { p, grade: currentStudent.grade, tier };
  const seen = state.seenBadges[currentStudent.id] ?? {};
  const isStudent = state.session?.role === "elev";
  const earnedCount = BADGES.filter((b) => b.earned(ctx)).length;
  const categories = Object.keys(CATEGORY_INFO) as BadgeCategory[];
  const openBadge = BADGES.find((b) => b.id === open);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3"><Icon name="marken" size={40} /> {isStudent ? "Mina märken" : `${currentStudent.name}s märken`}</h1>
          <p className="mt-1 text-muted">Årskurs {currentStudent.grade} · Klicka på ett märke för att läsa mer.</p>
        </div>
        <div className="rounded-2xl bg-paper px-5 py-3 text-center shadow-sm ring-1 ring-line">
          <p className="font-serif text-3xl font-bold text-navy">
            {earnedCount}
            <span className="text-lg text-muted"> / {BADGES.length}</span>
          </p>
          <p className="text-xs text-muted">märken upplåsta</p>
        </div>
      </div>

      {isStudent && (
        <MascotSays mood={earnedCount > 0 ? "dansar" : "glad"}>
          {earnedCount === 0
            ? "Här samlar du märken när du klarar saker. Det första är närmare än du tror!"
            : earnedCount < 6
              ? `Du har redan ${earnedCount} märken. Se vilka du kan jaga härnäst!`
              : `${earnedCount} märken! Du är en riktig mattestjärna.`}
        </MascotSays>
      )}

      {categories.map((cat) => {
        const list = BADGES.filter((b) => b.category === cat);
        return (
          <section key={cat}>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
              <span className="h-5 w-1.5 rounded-full" style={{ background: CATEGORY_INFO[cat].color }} />
              {CATEGORY_INFO[cat].title}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {list.map((b) => {
                const earned = b.earned(ctx);
                const prog = b.progress?.(ctx);
                return (
                  <button
                    key={b.id}
                    onClick={() => setOpen(b.id)}
                    className={`group flex flex-col items-center rounded-2xl p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      earned ? "bg-paper ring-1 ring-line" : "bg-cream ring-1 ring-dashed ring-line"
                    }`}
                  >
                    <div className="transition-transform group-hover:scale-105">
                      <BadgeMedal badge={b} earned={earned} size={68} progress={prog} />
                    </div>
                    <span className={`mt-1 text-sm font-semibold leading-tight ${earned ? "text-navy" : "text-muted"}`}>{b.name}</span>
                    {!earned && prog !== undefined && prog > 0 && <span className="mt-0.5 text-[0.7rem] text-muted">{Math.round(prog * 100)} %</span>}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {openBadge && (
        <BadgeDetail
          badge={openBadge}
          earned={openBadge.earned(ctx)}
          earnedAt={seen[openBadge.id]}
          progress={openBadge.progress?.(ctx)}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
