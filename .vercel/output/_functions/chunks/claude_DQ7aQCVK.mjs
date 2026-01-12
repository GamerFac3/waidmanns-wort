import Anthropic from '@anthropic-ai/sdk';
import { C as CATEGORIES, A as AUTHOR } from './consts_Bxvkf2X3.mjs';

const anthropic = new Anthropic({
  apiKey: undefined                                 
});
const SYSTEM_PROMPT = `Du bist ${AUTHOR.name}, ein erfahrener Jäger aus dem ${AUTHOR.location}.
${AUTHOR.bio}

Du schreibst persönliche, authentische Blogartikel über die Jagd in Deutschland. Dein Schreibstil ist:
- Persönlich und aus der Ich-Perspektive
- Bodenständig und traditionsbewusst, aber nicht altmodisch
- Fachkundig mit korrekter Jägersprache (Waidmannssprache)
- Anekdotenhaft - du erzählst gerne von eigenen Erlebnissen
- Respektvoll gegenüber der Natur und dem Wild
- Für ein älteres, erfahrenes Publikum geschrieben (andere Jäger)

Wichtige Hinweise:
- Verwende die korrekte deutsche Jägersprache (z.B. "Stück" statt "Tier", "erlegen" statt "schießen")
- Beziehe dich auf deutsche/bayerische Verhältnisse
- Erwähne gelegentlich deinen Jagdhund, das Revier, oder Erlebnisse
- Sei authentisch - gib auch mal Fehler zu oder zeige Meinungen
- Keine Werbung oder Affiliate-Links
- Schreibe in gutem, aber natürlichem Deutsch

Formatierung:
- Nutze Markdown für Überschriften (##, ###)
- Absätze für bessere Lesbarkeit
- Gelegentlich Aufzählungen wo sinnvoll
- Artikel sollten 800-1200 Wörter haben`;
async function generateArticleContent(title, description, category) {
  const categoryInfo = CATEGORIES.find((c) => c.id === category);
  const categoryName = categoryInfo?.name || category;
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2e3,
    messages: [
      {
        role: "user",
        content: `Schreibe einen Blogartikel mit folgendem Titel und Beschreibung:

Titel: ${title}
Beschreibung: ${description}
Kategorie: ${categoryName}

Der Artikel soll persönlich und authentisch sein, als würdest du ihn wirklich für deinen Blog schreiben. Beginne direkt mit dem Inhalt (ohne den Titel zu wiederholen).`
      }
    ],
    system: SYSTEM_PROMPT
  });
  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  throw new Error("Unexpected response type from Claude");
}
async function generateNewTitles(count = 5) {
  const categoryList = CATEGORIES.map((c) => `- ${c.id}: ${c.name}`).join("\n");
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Generiere ${count} interessante Blogartikel-Ideen für meinen Jagdblog.
Jede Idee soll einen aussagekräftigen Titel und eine kurze Beschreibung (1 Satz) haben.
Die Themen sollen abwechslungsreich sein und verschiedene Kategorien abdecken.

Verfügbare Kategorien:
${categoryList}

Antworte NUR mit einem JSON-Array in diesem Format:
[
  {"title": "...", "description": "...", "category": "kategorie_id"},
  ...
]

Keine weiteren Erklärungen, nur das JSON.`
      }
    ],
    system: SYSTEM_PROMPT
  });
  const content = message.content[0];
  if (content.type === "text") {
    try {
      return JSON.parse(content.text);
    } catch {
      throw new Error("Failed to parse titles from Claude response");
    }
  }
  throw new Error("Unexpected response type from Claude");
}

export { generateNewTitles as a, generateArticleContent as g };
