# AGENTS.md

Instruktionen für KI-Agenten, die an diesem Projekt arbeiten.

## Projektübersicht

Dies ist **Waidmanns Wort**, ein KI-generierter deutscher Jagdblog. Das Projekt verwendet Astro als Frontend-Framework, Supabase als Datenbank und die Anthropic Claude API zur Generierung von Artikelinhalten.

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `src/lib/supabase.ts` | Supabase-Client-Initialisierung |
| `src/lib/claude.ts` | Claude API Integration und Prompts |
| `src/lib/database.types.ts` | TypeScript-Typen für Supabase |
| `src/consts.ts` | Autor-Persona, Kategorien, Site-Konstanten |
| `src/pages/artikel/[id].astro` | Dynamische Artikelseite mit On-Demand-Generierung |
| `src/pages/api/generate-*.ts` | API-Routen für Titel- und Artikelgenerierung |
| `astro.config.mjs` | Astro-Konfiguration (Vercel-Adapter, SSR) |

## Datenbank

### Supabase-Projekt
- Projekt-URL: Über `SUPABASE_URL` Environment-Variable
- Anon Key: Über `SUPABASE_ANON_KEY` Environment-Variable (nur für Leseoperationen)
- Service Role Key: Über `SUPABASE_SERVICE_ROLE_KEY` Environment-Variable (für Schreiboperationen)

### Tabellen

**article_titles**
- `id` (UUID, PK): Eindeutige ID
- `title` (TEXT): Artikeltitel
- `description` (TEXT): Kurzbeschreibung
- `category` (TEXT): Kategorie-ID (siehe `CATEGORIES` in consts.ts)
- `created_at` (TIMESTAMPTZ): Erstellungszeitpunkt
- `is_generated` (BOOLEAN): True wenn Artikel bereits generiert

**articles**
- `id` (UUID, PK): Eindeutige ID
- `title_id` (UUID, FK): Referenz zu article_titles
- `content` (TEXT): Markdown-formatierter Artikelinhalt
- `generated_at` (TIMESTAMPTZ): Generierungszeitpunkt

### Row Level Security
Beide Tabellen haben RLS aktiviert:
- **Anon-Rolle**: Nur SELECT (Leseoperationen) erlaubt
- **Service Role**: Umgeht RLS komplett (für INSERT/UPDATE im Server-Code)

**Wichtig**: Für Schreiboperationen muss `supabaseAdmin` verwendet werden, nicht `supabase`.

## Architektur

```
Benutzer → Astro (Vercel) → Supabase (Daten)
                ↓
            Claude API (Generierung)
```

1. Startseite lädt Titel aus Supabase
2. Bei Artikelaufruf wird geprüft ob Inhalt existiert
3. Falls nicht: Claude generiert Artikel, speichert in Supabase
4. Generierte Artikel werden gecacht (is_generated = true)

## Persona

Der Blog wird im Namen von **Heinrich Bergmann** geschrieben:
- Fiktiver Jäger aus dem Bayerischen Wald
- 35 Jahre Jagderfahrung
- Schreibstil: Persönlich, fachkundig, traditionsbewusst
- Verwendet korrekte Jägersprache (Waidmannssprache)

## Kategorien

Die gültigen Kategorie-IDs sind:
- `wild`, `waffen`, `ausruestung`, `revier`, `hunde`
- `wald`, `fahrzeuge`, `praxis`, `recht`, `tradition`

## Entwicklung

```bash
npm install      # Abhängigkeiten
npm run dev      # Dev-Server (localhost:4321)
npm run build    # Produktions-Build
npm run preview  # Build lokal testen
```

## Hinweise für Agenten

1. **Umgebungsvariablen**: Niemals Secrets in Code oder Dokumentation einfügen
2. **TypeScript**: Projekt verwendet strikte Typisierung, `database.types.ts` bei Schema-Änderungen aktualisieren
3. **Deutsche Sprache**: Blog-Inhalte und UI sind auf Deutsch
4. **Markdown**: Artikelinhalte sind Markdown, werden client-seitig gerendert
5. **SSR**: Projekt läuft im Server-Rendering-Modus auf Vercel
6. **Supabase MCP**: Für Datenbankoperationen steht das Supabase MCP zur Verfügung

## Typische Aufgaben

### Neue Kategorie hinzufügen
1. `CATEGORIES` Array in `src/consts.ts` erweitern
2. Ggf. UI-Anpassungen für Kategorie-Anzeige

### Schema-Änderungen
1. Migration über Supabase MCP erstellen
2. TypeScript-Typen mit `generate_typescript_types` neu generieren
3. `src/lib/database.types.ts` aktualisieren

### Neue API-Route
1. Datei in `src/pages/api/` erstellen
2. `APIRoute` Type aus `astro` importieren
3. Supabase-Clients aus `src/lib/supabase` importieren:
   - `supabase` für Leseoperationen (SELECT)
   - `supabaseAdmin` für Schreiboperationen (INSERT, UPDATE, DELETE)
4. Prüfen ob `supabaseAdmin` verfügbar ist bevor Schreiboperationen ausgeführt werden
