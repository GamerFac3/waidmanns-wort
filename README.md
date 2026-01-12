# Waidmanns Wort

Ein KI-generierter Jagdblog in deutscher Sprache, der als fiktiver Jäger "Heinrich Bergmann" aus dem Bayerischen Wald schreibt.

## Übersicht

Waidmanns Wort ist ein Astro-basierter Blog, der automatisch Jagdartikel mithilfe von Claude (Anthropic) generiert. Die Artikel werden in einer Supabase-Datenbank gespeichert und bei Bedarf on-demand erstellt.

## Tech Stack

- **Frontend**: [Astro](https://astro.build/) mit Server-Side Rendering
- **Datenbank**: [Supabase](https://supabase.com/) (PostgreSQL)
- **KI**: [Anthropic Claude](https://anthropic.com/) für Artikelgenerierung
- **Hosting**: [Vercel](https://vercel.com/)

## Projektstruktur

```
src/
├── components/         # Astro-Komponenten (Header, Footer, etc.)
├── lib/
│   ├── supabase.ts    # Supabase-Client-Konfiguration
│   ├── claude.ts      # Claude API Integration
│   └── database.types.ts  # TypeScript-Typen für die Datenbank
├── pages/
│   ├── index.astro    # Startseite mit Artikelübersicht
│   ├── about.astro    # Über-Seite
│   ├── artikel/
│   │   └── [id].astro # Dynamische Artikelseite
│   └── api/
│       ├── generate-article.ts  # API zum Generieren eines Artikels
│       └── generate-titles.ts   # API zum Generieren neuer Titel
└── consts.ts          # Konstanten (Autor, Kategorien, etc.)
```

## Datenbank-Schema

### article_titles
Speichert Artikelideen und Metadaten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| title | TEXT | Artikeltitel |
| description | TEXT | Kurzbeschreibung |
| category | TEXT | Kategorie-ID |
| created_at | TIMESTAMPTZ | Erstellungsdatum |
| is_generated | BOOLEAN | Ob der Artikel bereits generiert wurde |

### articles
Speichert generierte Artikelinhalte.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| title_id | UUID | Fremdschlüssel zu article_titles |
| content | TEXT | Generierter Markdown-Inhalt |
| generated_at | TIMESTAMPTZ | Generierungsdatum |

## Kategorien

- Wild & Wildarten
- Waffen & Optik
- Ausrüstung
- Revier & Hege
- Jagdhunde
- Wald & Natur
- Fahrzeuge
- Jagdpraxis
- Jagdrecht
- Brauchtum

## Umgebungsvariablen

Erstelle eine `.env`-Datei im Projektroot:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Hinweis zur Sicherheit:**
- Der `ANON_KEY` wird für öffentliche Leseoperationen verwendet (RLS-geschützt)
- Der `SERVICE_ROLE_KEY` wird server-seitig für Schreiboperationen verwendet (umgeht RLS)
- Der Service Role Key darf **niemals** im Client-Code oder im Browser exponiert werden

## Installation

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Produktions-Build lokal testen
npm run preview
```

## Funktionsweise

1. **Titel-Generierung**: Über `/api/generate-titles` werden neue Artikelideen von Claude generiert und in der Datenbank gespeichert.

2. **On-Demand Artikel**: Wenn ein Benutzer einen Artikel aufruft (`/artikel/[id]`), wird geprüft, ob der Inhalt bereits existiert. Falls nicht, wird er live von Claude generiert.

3. **Caching**: Einmal generierte Artikel werden in Supabase gespeichert und bei weiteren Aufrufen direkt geladen.

## API-Endpunkte

### POST /api/generate-titles
Generiert neue Artikelideen (maximal 5 ungenerierte Titel werden vorgehalten).

### POST /api/generate-article
Generiert einen Artikel für eine gegebene Titel-ID.

**Body:**
```json
{
  "titleId": "uuid-der-titel-id"
}
```

## Lizenz

Privates Projekt
