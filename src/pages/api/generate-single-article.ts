import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import {
	generateNewTitles,
	generateArticleContent,
	generateImagePrompt,
	generateImage,
	calculateArticleStats,
} from '../../lib/replicate';

export const POST: APIRoute = async ({ request }) => {
	// Create a readable stream for Server-Sent Events
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			const sendEvent = (data: object) => {
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
			};

			try {
				if (!supabaseAdmin) {
					sendEvent({ step: 'error', message: 'Server configuration error: missing service role key', phase: 'init' });
					controller.close();
					return;
				}

				// Parse request body
				let existingTitles: string[] = [];
				try {
					const body = await request.json();
					existingTitles = body.existingTitles || [];
				} catch {
					// No body or invalid JSON, use empty array
				}

				// Step 1: Generate title
				sendEvent({ step: 'generating_title', message: 'Titel wird generiert...' });

				// Fetch all existing article titles to avoid duplicates
				const { data: existingArticles, error: fetchError } = await supabase
					.from('article_titles')
					.select('title');

				if (fetchError) {
					sendEvent({ step: 'error', message: `Failed to fetch existing titles: ${fetchError.message}`, phase: 'generating_title' });
					controller.close();
					return;
				}

				// Combine database titles with passed titles
				const allExistingTitles = [
					...(existingArticles?.map(a => a.title) || []),
					...existingTitles
				];

				// Generate exactly 1 new title
				const newTitles = await generateNewTitles(1, allExistingTitles);

				if (!newTitles || newTitles.length === 0) {
					sendEvent({ step: 'error', message: 'Failed to generate title', phase: 'generating_title' });
					controller.close();
					return;
				}

				const titleData = newTitles[0];

				// Insert title into database
				const { data: insertedTitle, error: insertError } = await supabaseAdmin
					.from('article_titles')
					.insert(titleData)
					.select()
					.single();

				if (insertError || !insertedTitle) {
					sendEvent({ step: 'error', message: `Failed to save title: ${insertError?.message}`, phase: 'generating_title' });
					controller.close();
					return;
				}

				sendEvent({
					step: 'title_complete',
					title: insertedTitle.title,
					description: insertedTitle.description,
					titleId: insertedTitle.id
				});

				// Step 2: Generate content
				sendEvent({ step: 'generating_content', message: 'Inhalt wird geschrieben...' });

				const content = await generateArticleContent(
					insertedTitle.title,
					insertedTitle.description,
					insertedTitle.category
				);

				const stats = calculateArticleStats(content);

				sendEvent({
					step: 'content_complete',
					wordCount: stats.word_count,
					readingTime: stats.reading_time_minutes
				});

				// Step 3: Generate image prompt
				sendEvent({ step: 'generating_image_prompt', message: 'Bildprompt wird erstellt...' });

				const imagePrompt = await generateImagePrompt(
					insertedTitle.title,
					insertedTitle.description,
					insertedTitle.category
				);

				sendEvent({
					step: 'image_prompt_complete',
					prompt: imagePrompt
				});

				// Step 4: Generate image
				sendEvent({ step: 'generating_image', message: 'Bild wird generiert...' });

				const generatedImageUrl = await generateImage(imagePrompt);

				sendEvent({
					step: 'image_complete',
					tempUrl: generatedImageUrl
				});

				// Step 5: Upload image
				sendEvent({ step: 'uploading', message: 'Bild wird hochgeladen...' });

				const imageResponse = await fetch(generatedImageUrl);
				const imageBuffer = await imageResponse.arrayBuffer();

				const fileName = `generated-${insertedTitle.id}-${Date.now()}.webp`;
				const { error: uploadError } = await supabaseAdmin.storage
					.from('article-images')
					.upload(fileName, imageBuffer, {
						contentType: 'image/webp',
						upsert: true,
					});

				if (uploadError) {
					sendEvent({ step: 'error', message: `Image upload failed: ${uploadError.message}`, phase: 'uploading' });
					controller.close();
					return;
				}

				const { data: { publicUrl } } = supabaseAdmin.storage
					.from('article-images')
					.getPublicUrl(fileName);

				sendEvent({
					step: 'upload_complete',
					imageUrl: publicUrl
				});

				// Step 6: Save article
				sendEvent({ step: 'saving', message: 'Wird gespeichert...' });

				// Insert article content
				const { error: articleError } = await supabaseAdmin
					.from('articles')
					.insert({
						title_id: insertedTitle.id,
						content: content,
					});

				if (articleError) {
					sendEvent({ step: 'error', message: `Article insert failed: ${articleError.message}`, phase: 'saving' });
					controller.close();
					return;
				}

				// Update article_titles with is_generated, stats, and image_url
				const { error: updateError } = await supabaseAdmin
					.from('article_titles')
					.update({
						is_generated: true,
						word_count: stats.word_count,
						reading_time_minutes: stats.reading_time_minutes,
						image_url: publicUrl,
					})
					.eq('id', insertedTitle.id);

				if (updateError) {
					sendEvent({ step: 'error', message: `Title update failed: ${updateError.message}`, phase: 'saving' });
					controller.close();
					return;
				}

				// Step 7: Complete
				sendEvent({
					step: 'complete',
					article: {
						id: insertedTitle.id,
						title: insertedTitle.title,
						description: insertedTitle.description,
						category: insertedTitle.category,
						imageUrl: publicUrl,
						wordCount: stats.word_count,
						readingTime: stats.reading_time_minutes,
					}
				});

				controller.close();

			} catch (error) {
				console.error('Generate single article error:', error);
				sendEvent({
					step: 'error',
					message: (error as Error).message || 'Unknown error occurred',
					phase: 'unknown'
				});
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
		},
	});
};
