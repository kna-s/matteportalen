"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AREAS, GRADES, Grade, chaptersFor } from "@/lib/curriculum";
import { ChapterCard } from "@/components/StepLink";
import { PageHeader } from "@/components/ui";

export default function GradePage() {
  const { grade: raw } = useParams<{ grade: string }>();
  const grade = Number(raw) as Grade;
  if (!GRADES.includes(grade)) return <p>Årskursen finns inte.</p>;

  return (
    <div>
      <Link href="/arskurs" className="text-sm text-muted hover:text-navy">
        ← Alla årskurser
      </Link>
      <PageHeader icon="arskurs" title={`Årskurs ${grade}`} intro="Här är alla kapitel för årskursen, sorterade efter område. Klicka på ett steg för att börja." />

      <nav className="mb-6 flex flex-wrap gap-2">
        {AREAS.map((a) => (
          <a key={a.id} href={`#${a.id}`} className="chip border border-line bg-paper px-3 py-1 text-sm text-navy hover:bg-gold-light">
            <Icon name={a.icon} size={18} />
            {a.title}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {AREAS.map((a) => (
          <section key={a.id} id={a.id} className="scroll-mt-32">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <span className="h-6 w-1.5 rounded-full" style={{ background: a.color }} />
              <Icon name={a.icon} size={30} />
              {a.title}
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {chaptersFor(grade, a.id).map((c) => (
                <ChapterCard key={c.id} chapter={c} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
