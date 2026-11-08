# Matteportalen

Läxhjälp i matematik för mellanstadiet (åk 4–6). Kursplanen följer Skolverkets centrala innehåll.

## Status: Fas 1 (klickbar prototyp)

- Utloggade ser en marknadssida riktad till föräldrar (startsida + /priser).
- Inloggade får appen med sidomeny: Startsida, Välj årskurs, Videolektioner, Matematikövningar, Screening, Quiz och utmaningar, Mina resultat, Föräldraportal, Mitt abonnemang.
- Föräldern skapar elevkonton och väljer vad som är **Aktuellt** för varje barn.
- Demo-inloggning som **elev**, **förälder** eller **admin** (vi som driver sajten och lägger upp innehåll). Ingen riktig inloggning än.
- Allt sparas i webbläsarens localStorage. Under Administration → Kunder kan demodatan återställas.
- Allt innehåll är platshållare och genereras i `src/lib/curriculum.ts`.
- Knappen **🎛️ Demo** nere till höger byter färger, maskot och nivå, och kan visa märkesnotiser.
- Jämförelsesidor: `/designval` (färger) och `/maskot` (maskotar).
- 18 märken (`src/lib/badges.ts`) som räknas om per årskurs. Nya märken visas som notis för eleven.

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

2. Riktig inloggning och databas (Supabase). Admin laddar upp eget innehåll.
3. Betalning (Stripe/Swish), e-post med veckorapport, månadsvisa uppdateringar och arkiv för gamla quiz (`publishedMonth`/`version` finns redan i datamodellen).
