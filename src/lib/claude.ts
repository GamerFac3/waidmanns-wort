import Anthropic from '@anthropic-ai/sdk';
import { AUTHOR, CATEGORIES } from '../consts';

const anthropic = new Anthropic({
	apiKey: import.meta.env.ANTHROPIC_API_KEY,
});

// Use Haiku for faster generation
const MODEL = 'claude-haiku-4-5';

const SYSTEM_PROMPT = `Du bist ${AUTHOR.name} (genannt "${AUTHOR.nickname}"), Jahrgang ${AUTHOR.birthYear}, ein erfahrener Jäger aus ${AUTHOR.village} im ${AUTHOR.location}. ${AUTHOR.bio}

DEINE FAMILIE:
- ${AUTHOR.family.wife}
- ${AUTHOR.family.children}
- ${AUTHOR.family.grandchildren}
- Dein Vater ${AUTHOR.family.father}
- ${AUTHOR.family.grandfather}

DEIN JAGDHUND:
- Aktuell: ${AUTHOR.dogs.current.name}, eine ${AUTHOR.dogs.current.breed} (${AUTHOR.dogs.current.age} Jahre alt). ${AUTHOR.dogs.current.description}. ${AUTHOR.dogs.current.traits}
- Frühere Hunde: ${AUTHOR.dogs.previous.map(d => `${d.name} (${d.breed}, ${d.years}) - ${d.description}`).join('; ')}

DEIN REVIER "${AUTHOR.revier.name}":
- Größe: ${AUTHOR.revier.size}, ${AUTHOR.revier.terrain}
- Höhenlage: ${AUTHOR.revier.elevation}
- Besonderheiten: ${AUTHOR.revier.features.join(', ')}
- Wildbestand: ${AUTHOR.revier.wildlife.hochwild}, ${AUTHOR.revier.wildlife.rehwild}, ${AUTHOR.revier.wildlife.niederwild}
- Infrastruktur: ${AUTHOR.revier.infrastructure.hochsitze}, ${AUTHOR.revier.infrastructure.huetten}

DEINE WAFFEN:
- Hauptwaffe: ${AUTHOR.weapons.primary.name} in ${AUTHOR.weapons.primary.caliber} mit ${AUTHOR.weapons.primary.scope} - ${AUTHOR.weapons.primary.description}
- Zweitwaffe: ${AUTHOR.weapons.secondary.name} in ${AUTHOR.weapons.secondary.caliber} - ${AUTHOR.weapons.secondary.description}
- Flinte: ${AUTHOR.weapons.shotgun.name} ${AUTHOR.weapons.shotgun.caliber} - ${AUTHOR.weapons.shotgun.description}
- Erbstück: ${AUTHOR.weapons.inherited}

DEIN FAHRZEUG: ${AUTHOR.vehicle.current}. ${AUTHOR.vehicle.opinion}

DEINE JAGDFREUNDE:
- ${AUTHOR.companions.main}
- ${AUTHOR.companions.forester}
- ${AUTHOR.companions.butcher}

DEINE EIGENHEITEN:
- Gewohnheiten: ${AUTHOR.traits.habits.join('; ')}
- Meinungen: ${AUTHOR.traits.opinions.join('; ')}
- Bekannte Geschichten zum Erwähnen: ${AUTHOR.traits.stories.join('; ')}

SCHREIBSTIL:
- Persönlich, aus der Ich-Perspektive
- Bodenständig, traditionsbewusst
- Fachkundig mit korrekter Jägersprache (Waidmannssprache)
- Anekdotenhaft mit eigenen Erlebnissen - beziehe dich auf obige Details!
- Respektvoll gegenüber Natur und Wild

JÄGERSPRACHE:
- "Stück" statt "Tier"
- "erlegen" statt "schießen"
- "Revier" für Jagdgebiet
- "ansprechen" für Wild beurteilen
- "Waidmannsheil" als Gruß

WICHTIG:
- Bayerische/deutsche Verhältnisse
- Erwähne gelegentlich deinen Jagdhund Alma, dein Revier Tannberg, oder Erlebnisse mit Franz Huber
- Authentisch - auch Fehler zugeben
- Keine Werbung
- Bleibe konsistent mit den obigen Fakten!`;

/**
 * Cleans and normalizes markdown content to prevent rendering issues
 */
export function cleanMarkdown(text: string): string {
	return text
		// Remove any leading/trailing whitespace
		.trim()
		// Normalize line endings
		.replace(/\r\n/g, '\n')
		// Remove excessive blank lines (more than 2)
		.replace(/\n{3,}/g, '\n\n')
		// Ensure headers have space after #
		.replace(/^(#{1,3})([^#\s])/gm, '$1 $2')
		// Remove any HTML tags that might cause issues
		.replace(/<script[^>]*>.*?<\/script>/gi, '')
		.replace(/<style[^>]*>.*?<\/style>/gi, '')
		// Escape any raw HTML except allowed tags
		.replace(/<(?!\/?(?:strong|em|ul|ol|li|p|br|h[1-6])\b)[^>]+>/gi, '')
		// Fix broken list items (ensure dash has space)
		.replace(/^-([^\s])/gm, '- $1')
		// Remove horizontal rules that might break layout
		.replace(/^[-*_]{3,}$/gm, '')
		// Ensure paragraphs are properly separated
		.replace(/([^\n])\n([^\n-#*])/g, '$1\n\n$2');
}

function buildArticlePrompt(title: string, description: string, category: string): string {
	const categoryInfo = CATEGORIES.find(c => c.id === category);
	const categoryName = categoryInfo?.name || category;

	return `Schreibe einen Blogartikel.

TITEL: ${title}
THEMA: ${description}
KATEGORIE: ${categoryName}

FORMATIERUNG (strikt einhalten):
- Beginne DIREKT mit dem ersten Absatz (kein Titel, keine Einleitung wie "Heute möchte ich...")
- Verwende ## für Zwischenüberschriften (2-3 im Artikel)
- Normale Absätze mit Leerzeile dazwischen
- Aufzählungen mit "- " am Zeilenanfang
- KEINE horizontalen Linien (---)
- KEINE Codeblöcke
- KEIN HTML
- Länge: 600-800 Wörter

Schreibe authentisch und persönlich aus deiner Erfahrung als Jäger.`;
}

export async function generateArticleContent(
	title: string,
	description: string,
	category: string
): Promise<string> {
	const message = await anthropic.messages.create({
		model: MODEL,
		max_tokens: 1500,
		messages: [
			{
				role: 'user',
				content: buildArticlePrompt(title, description, category),
			},
		],
		system: SYSTEM_PROMPT,
	});

	const content = message.content[0];
	if (content.type === 'text') {
		return cleanMarkdown(content.text);
	}
	throw new Error('Unexpected response type from Claude');
}

export async function* streamArticleContent(
	title: string,
	description: string,
	category: string
): AsyncGenerator<string, string, unknown> {
	const stream = anthropic.messages.stream({
		model: MODEL,
		max_tokens: 1500,
		messages: [
			{
				role: 'user',
				content: buildArticlePrompt(title, description, category),
			},
		],
		system: SYSTEM_PROMPT,
	});

	let fullContent = '';

	for await (const event of stream) {
		if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
			fullContent += event.delta.text;
			yield event.delta.text;
		}
	}

	return cleanMarkdown(fullContent);
}

export async function generateNewTitles(count: number = 5): Promise<Array<{
	title: string;
	description: string;
	category: string;
}>> {
	const categoryList = CATEGORIES.map(c => `${c.id}: ${c.name}`).join(', ');

	const message = await anthropic.messages.create({
		model: MODEL,
		max_tokens: 1000,
		messages: [
			{
				role: 'user',
				content: `Generiere ${count} Blogartikel-Ideen für einen deutschen Jagdblog.

Kategorien: ${categoryList}

Antworte NUR mit JSON-Array:
[{"title":"...","description":"...","category":"kategorie_id"}]

Regeln:
- Titel: Interessant, konkret, 5-10 Wörter
- Description: Ein Satz, was der Leser lernt
- Category: Exakt eine der obigen IDs
- Themen: Abwechslungsreich, praxisnah`,
			},
		],
		system: 'Du generierst JSON-Daten für einen Jagdblog. Antworte NUR mit validem JSON.',
	});

	const content = message.content[0];
	if (content.type === 'text') {
		try {
			// Extract JSON from response (in case there's extra text)
			const jsonMatch = content.text.match(/\[[\s\S]*\]/);
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0]);
			}
			return JSON.parse(content.text);
		} catch {
			throw new Error('Failed to parse titles from Claude response');
		}
	}
	throw new Error('Unexpected response type from Claude');
}
