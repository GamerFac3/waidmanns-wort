import Replicate from 'replicate';
import { AUTHOR, CATEGORIES } from '../consts';

const replicate = new Replicate({
	auth: import.meta.env.REPLICATE_API_TOKEN,
});

// Text model - Meta Llama 3 70B Instruct (more capable for creative writing)
const TEXT_MODEL = 'meta/meta-llama-3-70b-instruct' as const;

// Cheap image model - Flux Schnell (already fast and affordable)
const IMAGE_MODEL = 'black-forest-labs/flux-schnell' as const;

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

async function generateText(prompt: string, systemPrompt: string = SYSTEM_PROMPT, maxTokens: number = 2048): Promise<string> {
	const output = await replicate.run(TEXT_MODEL, {
		input: {
			prompt: prompt,
			system_prompt: systemPrompt,
			max_tokens: maxTokens,
			temperature: 0.7,
			top_p: 0.9,
		},
	});

	// Output is an array of strings, join them
	if (Array.isArray(output)) {
		return output.join('').trim();
	}
	return String(output).trim();
}

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
	const content = await generateText(
		buildArticlePrompt(title, description, category),
		SYSTEM_PROMPT,
		2048
	);
	return cleanMarkdown(content);
}

export async function generateImagePrompt(
	title: string,
	description: string,
	category: string
): Promise<string> {
	const prompt = `Erstelle eine detaillierte Bildbeschreibung für einen Jagdblog-Artikel.

TITEL: ${title}
BESCHREIBUNG: ${description}
KATEGORIE: ${category}

Generiere eine englische Bildbeschreibung für ein KI-Bildgenerator.

Anforderungen:
- Beschreibe eine stimmungsvolle Jagdszene passend zum Thema
- Natürliche Landschaft (bayerische/deutsche Alpen, Wald, Wiesen)
- Authentische Jagdatmosphäre
- Keine Menschen im Bild
- Natürliches Licht (Morgenlicht, Abendlicht, goldene Stunde)
- Fotografischer Stil, hochwertig

Antworte NUR mit der englischen Bildbeschreibung, keine Erklärungen.`;

	const systemPrompt = 'Du bist ein Experte für Bildbeschreibungen. Generiere präzise, detaillierte Prompts für KI-Bildgeneratoren.';

	return generateText(prompt, systemPrompt, 300);
}

/**
 * Calculate article statistics for SEO
 */
export function calculateArticleStats(content: string): { word_count: number; reading_time_minutes: number } {
	const words = content.trim().split(/\s+/).filter(w => w.length > 0);
	const word_count = words.length;
	// Average reading speed: 200 words per minute for German text
	const reading_time_minutes = Math.max(1, Math.ceil(word_count / 200));
	return { word_count, reading_time_minutes };
}

/**
 * Generate a URL-friendly slug from German text
 */
export function generateSlug(text: string): string {
	const germanChars: Record<string, string> = {
		'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
		'Ä': 'ae', 'Ö': 'oe', 'Ü': 'ue'
	};

	return text
		.toLowerCase()
		.replace(/[äöüßÄÖÜ]/g, char => germanChars[char] || char)
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80);
}

export interface ArticleTitleWithSEO {
	title: string;
	description: string;
	category: string;
	// SEO fields
	meta_title: string;
	meta_description: string;
	focus_keyword: string;
	keywords: string[];
	slug: string;
	og_title: string;
	og_description: string;
	image_alt: string;
}

export async function generateNewTitles(count: number = 5, existingTitles: string[] = []): Promise<ArticleTitleWithSEO[]> {
	const categoryList = CATEGORIES.map(c => `${c.id}: ${c.name}`).join(', ');

	const existingTitlesSection = existingTitles.length > 0
		? `\n\nBEREITS EXISTIERENDE ARTIKEL (NICHT wiederholen oder zu ähnlich sein):
${existingTitles.map(t => `- ${t}`).join('\n')}\n`
		: '';

	const prompt = `Generiere ${count} Blogartikel-Ideen für einen deutschen Jagdblog mit vollständigen SEO-Daten.

Kategorien: ${categoryList}${existingTitlesSection}

Antworte NUR mit JSON-Array im folgenden Format:
[{
  "title": "Artikeltitel (5-10 Wörter, ansprechend)",
  "description": "Kurze Beschreibung was der Leser lernt (1 Satz)",
  "category": "kategorie_id",
  "meta_title": "SEO-Titel für Suchmaschinen (50-60 Zeichen, mit Keyword)",
  "meta_description": "SEO-Beschreibung für Suchergebnisse (150-160 Zeichen, Call-to-Action)",
  "focus_keyword": "Haupt-Keyword für SEO (1-3 Wörter)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "og_title": "Titel für Social Media (emotional, klickstark)",
  "og_description": "Beschreibung für Social Media (neugierig machend, 100-120 Zeichen)",
  "image_alt": "Bildbeschreibung für Barrierefreiheit (beschreibend, mit Keyword)"
}]

SEO-Regeln:
- meta_title: Exakt 50-60 Zeichen, Keyword am Anfang, Marke am Ende möglich
- meta_description: Exakt 150-160 Zeichen, Handlungsaufforderung, Keyword enthalten
- focus_keyword: Das wichtigste Suchbegriff für diesen Artikel
- keywords: 5 relevante Suchbegriffe (Mix aus Short-tail und Long-tail)
- og_title: Emotional, kann Emojis enthalten, macht neugierig
- og_description: Kurz, prägnant, weckt Interesse
- image_alt: Beschreibt das Bild, enthält Keyword natürlich
- Themen: Abwechslungsreich, saisonal relevant, praxisnah`;

	const systemPrompt = 'Du bist ein SEO-Experte für deutschen Content. Generiere präzises JSON mit optimalen SEO-Daten. Antworte NUR mit validem JSON.';

	const response = await generateText(prompt, systemPrompt, 2500);

	try {
		// Extract JSON from response (in case there's extra text)
		const jsonMatch = response.match(/\[[\s\S]*\]/);
		const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);

		// Add slugs to each title
		return parsed.map((item: Omit<ArticleTitleWithSEO, 'slug'> & { slug?: string }) => ({
			...item,
			slug: item.slug || generateSlug(item.title),
		}));
	} catch {
		throw new Error('Failed to parse titles from Replicate response');
	}
}

export async function generateImage(imagePrompt: string): Promise<string> {
	const output = await replicate.run(IMAGE_MODEL, {
		input: {
			prompt: imagePrompt,
			aspect_ratio: '16:9',
			output_format: 'webp',
			output_quality: 90,
		},
	});

	// Output is typically an array with the image URL
	if (Array.isArray(output) && output.length > 0) {
		return output[0] as string;
	}
	return String(output);
}
