# Matteportalen

Läxhjälp i matematik för mellanstadiet (åk 4–6). Kursplanen följer Skolverkets centrala innehåll.

## Status: Fas 1 (klickbar prototyp)

- Alla flikar: Startsida, Välj årskurs, Videolektioner, Matematikövningar, Screening, Quiz och utmaningar, Mina resultat, Föräldraportal, Mitt abonnemang, plus en Lärarvy för våra lärare.
- Demo-inloggning som **elev**, **förälder** eller **lärare** (ingen riktig inloggning än).
- Allt sparas i webbläsarens localStorage. Under "Lärarvy" kan demodatan återställas.
- Allt innehåll är platshållare och genereras i `src/lib/curriculum.ts`.
- Nivån kan bytas med rutan "Demo-nivå" nere till vänster.

### Nivåer och flöde ("Nästa")

| Nivå | Flöde |
|---|---|
| Gratis | 2 videor + 2 övningar (de två första kapitlen i åk 4) |
| Start | Video → Övning → (quiz låst) → nästa video |
| Plus | Video → Övning → Quiz med kort kommentar → nästa video |
| Premium | Video → Övning → Quiz → Full screening och träningsplan → nästa video |

Reglerna finns i `src/lib/tiers.ts` och `src/lib/flow.ts`.

### Hjälpmedel
Kalkylator, linjal, gradskiva, koordinatsystem och tallinje (`src/components/tools`). Vilka som visas styrs per uppgift via `Step.tools`.

## Kom igång

```bash
npm install
npm run dev
```

Öppna http://localhost:3000.

## Nästa faser

2. Riktig inloggning och databas (Supabase). Lärare laddar upp eget innehåll.
3. Betalning (Stripe/Swish), e-post med veckorapport, månadsvisa uppdateringar och arkiv för gamla quiz (`publishedMonth`/`version` finns redan i datamodellen).
