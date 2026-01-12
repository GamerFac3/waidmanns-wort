# Waidmanns Wort - Setup Anleitung

## 1. Supabase einrichten

1. Erstelle ein Konto auf [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Gehe zu **SQL Editor** und führe das SQL aus `supabase-schema.sql` aus
4. Gehe zu **Settings > API** und kopiere:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`

## 2. Anthropic API Key

1. Gehe zu [console.anthropic.com](https://console.anthropic.com)
2. Erstelle einen API Key
3. Kopiere den Key → `ANTHROPIC_API_KEY`

## 3. Lokale Entwicklung

```bash
# .env Datei erstellen
cp .env.example .env

# Werte eintragen
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
ANTHROPIC_API_KEY=sk-ant-...

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## 4. Vercel Deployment

1. Pushe das Projekt zu GitHub
2. Importiere das Repo in [vercel.com](https://vercel.com)
3. Füge die Environment Variables hinzu:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy!

## 5. Neue Artikel-Titel generieren

Nach dem ersten Deployment kannst du neue Titel generieren lassen:

```bash
# Per API Call (POST request)
curl -X POST https://deine-domain.vercel.app/api/generate-titles
```

Oder füge einen Cron-Job in Vercel hinzu (`vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/generate-titles",
      "schedule": "0 6 * * 1"
    }
  ]
}
```

Dies generiert jeden Montag um 6 Uhr neue Titel.

## Wie es funktioniert

1. **Startseite**: Zeigt bis zu 5 "neue" Artikel (nur Titel) und alle bereits generierten Artikel
2. **Klick auf "neuen" Artikel**: Der Inhalt wird live per Claude API generiert und in Supabase gespeichert
3. **Danach**: Der Artikel ist im Archiv verfügbar und wird aus der Datenbank geladen

## Kosten

- **Supabase**: Free Tier reicht für den Anfang
- **Anthropic**: Ca. $0.003-0.015 pro generiertem Artikel (Claude Sonnet)
- **Vercel**: Free Tier für Hobby-Projekte

## Anpassungen

- **Persona ändern**: `src/consts.ts` → `AUTHOR`
- **Kategorien ändern**: `src/consts.ts` → `CATEGORIES`
- **Schreibstil ändern**: `src/lib/claude.ts` → `SYSTEM_PROMPT`
- **Design ändern**: `src/styles/global.css`
